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


// returns a promise
var fillStats = function(hashtag) {
    return client.search({
        "query": {
            "bool": {
                "must": [
                    {
                        "wildcard": {
                            "tweets.hashtags": hashtag
                        }
                    }
                ]
            }
        }
    })
};

/* GET tweets listing. */
router.get("/", function(req, res) {

    var output = {};
    var promises = [];
    var hashtags = [
        //"javascript", "angularjs", "backbone", "scala", "browserify", "iojs", "java", "apple"
        "iot", "sido", "objetsconnectes", "sidoevent", "gmc", "innovationdating"
    ];

    hashtags.forEach(function(ht) {
        promises.push(fillStats(ht));
    });

    Promise.all(promises).then(function(results) {
        for (var i = 0; i < promises.length; ++i) {
            var total = results[i].hits.total;
            output[hashtags[i]] = total;
        }
        res.send(output);
    });
});

module.exports = router;
