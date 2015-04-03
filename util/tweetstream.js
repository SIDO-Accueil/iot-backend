/*eslint-env node*/
"use strict";

var Twitter = require("twitter");
var elasticgetclient = require("../util/elasticsearch-getclient");

if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET ||
    !process.env.TWITTER_ACCESS_TOKEN_KEY || !process.env.TWITTER_ACCESS_TOKEN_SECRET) {

    console.log("Some env variables are missings");
}

//noinspection Eslint
var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// get a client instance of elasticsearch
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

    var hts = hashtagslist.reduce(function(e,a){return e+","+a;});

    client.stream("statuses/filter",
        {track: hts, language: lang}, function (stream) {

        stream.on("data", function (tweet) {
            console.log("new tweet:" + tweet.created_at + ", lang: " + tweet.lang);

            var hts = [];
            tweet.entities.hashtags.forEach(function(e) {
               hts.push(e.text);
            });

            var mentions = [];
            tweet.entities.user_mentions.forEach(function(e) {
                mentions.push(e.screen_name);
            });

            if (tweet.lang === "en") {
                elasticClient.index({
                    index: "twitter",
                    type: "tweets",
                    id: tweet.id_str,
                    body: {
                        "usr": tweet.user.screen_name,
                        "name": tweet.user.name,
                        "txt": tweet.text,
                        "hashtags": hts,
                        "mentions": mentions
                    }
                });
            }
        });

        stream.on("error", function (error) {
            var waitXsec = new Promise(function (resolve, reject) {
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
