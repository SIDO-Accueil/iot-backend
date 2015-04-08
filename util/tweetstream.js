/*eslint-env node*/
"use strict";

//noinspection Eslint
var Promise = require("bluebird");
var Twitter = require("twitter");
var elasticgetclient = require("../util/elasticsearch-getclient");
var sidomeByTwitterId = require("../util/sidomeByTwitterId");
var moment = require("moment");

if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET ||
    !process.env.TWITTER_ACCESS_TOKEN_KEY || !process.env.TWITTER_ACCESS_TOKEN_SECRET) {

    console.log("Some env variables are missings");
}

//noinspection Eslint
var clientTwitt = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// get a clientTwitt instance of elasticsearch
var elasticClient = elasticgetclient.get();

// small check to ensure the status of the elasticsearch cluster
elasticClient.cluster.health()
    .then(function(resp) {
        if (resp.status !== "green") {
            console.log("Please check unassigned_shards");
        } else {
            console.log("ElasticSearch: OK");
        }
    }, function (error) {
        console.trace(error.message);
    });

var backoff = 1000; // backoff starting at 1sec
var nextBackoff = function () {
    backoff *= 2;
    return backoff;
};

var getStreams = function (hashtagslist, lang) {
    console.log("getstream ok");

    var hts = hashtagslist.reduce(function(e, a){
        return e + "," + a;
    });

    clientTwitt.stream("statuses/filter",
        {track: hts, language: lang}, function (stream) {

        stream.on("data", function (tweet) {
            console.log("new tweet:" + tweet.created_at + ", lang: " + tweet.lang + "," + tweet.text);
            var htsi = [];
            tweet.entities.hashtags.forEach(function(e) {
               htsi.push(e.text);
            });

            var mentions = [];
            tweet.entities.user_mentions.forEach(function(e) {
                mentions.push(e.screen_name);
            });

            if (tweet.lang === "fr") {
                console.log("french tweet");
                elasticClient.index({
                    index: "twitter",
                    type: "tweets",
                    id: tweet.id_str,
                    body: {
                        "usr": tweet.user.screen_name,
                        "name": tweet.user.name,
                        "txt": tweet.text,
                        "hashtags": htsi,
                        "mentions": mentions,
                        "date": moment().unix()
                    }
                });

                console.log("screenname", tweet.user.screen_name);

                // increment the sidome.nbtweets if the yweet author has a registered sidome
                sidomeByTwitterId.sidomeByTwitterId(tweet.user.screen_name).then(function(sidomeMatching) {
                    console.log("sidome: " + sidomeMatching.id);
                    sidomeMatching.nbtweets += 1;

                    // Update the database
                    elasticClient.index({
                        index: "sidomes",
                        type: "sidomes",
                        id: sidomeMatching.id,
                        body: sidomeMatching
                    }).then(function () {
                        console.log("updated:)");
                    }, function (error) {
                        console.trace(error.message);
                    });
                });
            }
        });

        stream.on("error", function (error) {
            var waitXsec = new Promise(function (resolve) {
                setTimeout(function() {
                    resolve();
                }, nextBackoff());
            });
            waitXsec.then(function () {
                console.log("getStreams restarts after waiting " +
                            backoff + "ms");
                getStreams(hashtagslist, lang); // dangerous recursive call ?
            });

            console.log(error);
        });
    });
};

module.exports = {
    getStreams: getStreams
};
