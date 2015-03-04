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

//client.search({
//    q: "users"
//}).then(function (body) {
//    var hits = body.hits.hits;
//}, function (error) {
//    console.trace(error.message);
//});

/* GET users listing. */
router.get("/", function(req, res, next) {
    res.send("respond with a resource");
});

module.exports = router;
