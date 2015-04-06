/*eslint-env node*/
"use strict";

var express = require("express");

var elasticgetclient = require("../util/elasticsearch-getclient");
var lasttweet = require("../util/lasttweets");

//noinspection Eslint
var router = express.Router();

// get a client instance of elasticsearch
var client = elasticgetclient.get();

router.get("/", function(req, res) {
    client.search({
        "index": "twitter",
        "size": 3000,
        "q": "*"
    }).then(function (body) {

        // get all matchings tweets
        var hits = body.hits.hits;
        var ans = [];

        hits.forEach(function(j){
            //noinspection Eslint
            ans.push(j._source);
        });

        res.send(ans);
    }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send({});
    });
});

/* GET tweets listing. */
router.get("/last", function(req, res) {
    console.log("/last");
    lasttweet.lastTweet()
        .then(function (tweet) {
            console.log("ok");
            tweet.txt = tweet.txt.replace(/http:\/\/[^ ]*/, "");
            res.send(tweet);
        }).catch(function (err) {
            console.err(err);
            res.send({});
        });
});

module.exports = router;
