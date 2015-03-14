/*eslint-env node*/
/*global __dirname:false*/
"use strict";

var express = require("express");
var elasticsearch = require("elasticsearch");
var personmodel = require("../util/person-model");

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
router.get("/", function(req, res) {
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
router.post("/fill", function(req, res, next) {
    var MAXUSER = 1000;

    var allPromises = [];

    for (var i = 1; i < MAXUSER; ++i) {
        var s = personmodel.initJSON(i);

        // index the sidome to elasticsearch
        allPromises.push(client.index({
            index: "persons",
            type: "persons",
            id: i,
            body: s
        }));
    }

    Promise.all(allPromises).then(function() {
        console.log("all datas inserted");

        client.search({
            "index": "persons",
            "size": 1000,
            "q": "*"
        }).then(function (body) {

            // get all matchings persons
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

});


module.exports = router;
