/*eslint-env node*/
"use strict";

var express = require("express");
var elasticsearch = require("elasticsearch");

//noinspection Eslint
var router = express.Router();

// create a client instance of elasticsearch
var client = new elasticsearch.Client({
    host: "localhost:9200"
    //log: "trace"
});

// small check to ensure the status of the elasticsearch cluster
client.cluster.health()
    .then(function(resp) {
        if (resp.status !== "green") {
            console.log("Please check unassigned_shards");
        } else {
            console.log("ElasticSearch: OK");
        }
    }, function (error) {
        console.trace(error.message);
    });


/* GET tweets listing. */
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
        res.send(error.message);
    });
});

module.exports = router;
