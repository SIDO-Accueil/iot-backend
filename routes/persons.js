/*eslint-env node*/
/*global __dirname:false*/
"use strict";

var express = require("express");
var elasticsearch = require("elasticsearch");

//noinspection Eslint
var router = express.Router();

// create a client instance of elasticsearch
var client = new elasticsearch.Client({
    host: "localhost:9200",
    log: "trace"
});

// small check to ensure the status of the elasticsearch cluster
client.cluster.health()
    .then(function(resp) {
        if (resp.status !== "green") {
            console.trace("Please check unassigned_shards, check if two elasticsearch nodes are running");
        } else {
            console.log("ElasticSearch: OK");
        }
    }, function (error) {
        console.trace(error.message);
    });


/* GET persons listing. */
router.get("/", function(req, res, next) {
    client.search({
        index: "persons",
        q: "*"
    }).then(function (body) {

        // get all matchings persons
        var hits = body.hits.hits;
        res.send(hits);
    }, function (error) {
        console.trace(error.message);
        res.send(error.message);
    });
});

/* Create a new person with a default sidome */
router.post("/", function(req, res, next) {
    var pers = {
        "_id": 1,
        "name": "John Doe",
        "twitter": {
            "twitterId": "@devnull",
            "lastTweet": 1425511145 // timestamp of the last tweet with #sido
        },
        "badge": 1234
    };

    // index the person to elasticsearch
    client.index({
        index: "persons",
        type: "personAndAvatar",
        id: 1,
        body: pers
    }).then(function(resp) {
        res.setHeader("Location", "localhost:3000/persons/1");
        res.send(resp);
    });
});


module.exports = router;
