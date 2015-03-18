/*eslint-env node*/
"use strict";

var Twitter = require("twitter");
var elasticsearch = require("elasticsearch");

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

// create a client instance of elasticsearch
var elasticClient = new elasticsearch.Client({
    host: "localhost:9200"
    //log: "trace"
});
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

var getStreams = function () {
    console.log("getstream ok");

    client.stream("statuses/filter", {track: "#apple"}, function (stream) {
        stream.on("data", function (tweet) {
            console.log("new tweet:" + tweet.created_at + ", lang: " + tweet.lang);

            if (tweet.lang === "en") {
                elasticClient.index({
                    index: "twitter",
                    type: "tweets",
                    id: tweet.id_str,
                    body: {
                        "usr": tweet.user.screen_name,
                        "name": tweet.user.name,
                        "txt": tweet.text,
                        "hashtags": tweet.entities.hashtags,
                        "mentions": tweet.entities.user_mentions
                    }
                });
            }
        });

        stream.on("error", function (error) {
            console.log(error);
        });
    });
};

module.exports = {
    getStreams: getStreams
};
