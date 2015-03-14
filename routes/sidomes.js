/*eslint-env node*/
/*global __dirname:false*/
"use strict";

var express = require("express");
var elasticsearch = require("elasticsearch");
var sidomemodel = require("../util/sidome-model");

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
        "index": "sidomes",
        "size": 10000,
        "q": "*"
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
    var MAXUSER = 100;

    var allPromises = [];

    for (var i = 1; i < MAXUSER; ++i) {
        var s = sidomemodel.initJSON(i);

        // index the sidome to elasticsearch
        allPromises.push(client.index({
            index: "sidomes",
            type: "sidomes",
            id: i,
            body: s
        }));
    }

    Promise.all(allPromises).then(function() {
        console.log("all datas inserted");

        client.search({
            "index": "sidomes",
            "size": 10000,
            "q": "*"
        }).then(function (body) {

            // get all matchings persons
            var hits = body.hits.hits;
            res.send(hits);
        }, function (error) {
            console.trace(error.message);
            res.send(error.message);
        });
    });

});


module.exports = router;
