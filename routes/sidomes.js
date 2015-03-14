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


/* GET sidomes listing. */
router.get("/", function(req, res) {
    client.search({
        "index": "sidomes",
        "size": 10000,
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

/* GET a specific sidome . */
router.get("/:id", function(req, res) {
    client.search({
        "index": "sidomes",
        "q": req.params.id
    }).then(function (body) {

        if (body.hits.total > 1) {
            // error 500
            res.status(500);
        } else if (body.hits.total === 0) {
            // 404
            res.status(404);
        } else {
            //noinspection Eslint
            res.send(body.hits.hits[0]._source);
        }
    }, function (error) {
        console.trace(error.message);
        res.send(error.message);
    });
});

/* Create a new person with a default sidome */
router.post("/fill", function(req, res) {
    var MAXUSER = 10000;

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
            var ans = [];

            hits.forEach(function(j){
                //noinspection Eslint
                ans.push(j._source.sidome);
            });

            res.send(ans);
        }, function (error) {
            console.trace(error.message);
            res.send(error.message);
        });
    });

});

// POST /sidomes (ajout du sidome dans notre base)
router.post("/", function(req, res) {
    // get the json in the request payload
    var p = req.body;

    client.index({
        index: "sidomes",
        type: "sidomes",
        id: p.id,
        body: p
    }).then(function(d) {
        if (!d.created) {
            res.status(409);
            res.send({"created": d.created});
        } else {
            res.status(201);
            res.send({"created": d.created});
        }
    });
});

module.exports = router;
