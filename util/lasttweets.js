/*eslint-env node*/
"use strict";

var rp = require("request-promise");

//noinspection Eslint
var Promise = require("bluebird");

var lastTweet = function() {
    return new Promise(function (resolve, reject) {
        var queryElastic = rp.post({
            uri: "http://localhost:9200/twitter/_search",
            method: "POST",
            json: {
                "size": 1,
                "query": {
                    "term": {
                        "tweets.hashtags": "sido"
                    }
                },
                "sort": [
                    {
                        "date": {
                            "order": "desc"
                        }
                    }
                ]
            }
        });

        queryElastic
            .then(function(data) {
                console.log("{user: " + data.hits.hits[0]._source.usr + ", txt: " + data.hits.hits[0]._source.txt + "}");
                resolve({
                    user: data.hits.hits[0]._source.usr,
                    txt: data.hits.hits[0]._source.txt
                });
            })
            .catch(function(err) {
                console.error(err);
                console.log("{id: " + username + ", nbtweets: " + err + "}");
                reject(err);
            });
    });
};

module.exports = {
    lastTweet: lastTweet
};
