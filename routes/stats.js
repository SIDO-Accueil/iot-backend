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

// TODO REMOVE THIS CODE DUPLICATION !!!
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
        "query": {
            "bool": {
                "must": [
                    {
                        "wildcard": {
                            "tweets.hashtags": "iot"
                        }
                    }
                ]
            }
        }
    }).then(function (body) {

        var total = body.hits.total;
        res.send({
            "iot": total
        });
    }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send({});
    });
});

module.exports = router;
