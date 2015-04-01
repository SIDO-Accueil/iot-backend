/*eslint-env node*/
/*global __dirname:false*/
"use strict";

var express = require("express");
var elasticsearch = require("elasticsearch");
var sidomeinoutmodel = require("../util/sidome-inout-model");
var moment = require("moment");

var sidomes = require("../util/sidome-inout-model");

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
            console.log("Please check unassigned_shards");
        } else {
            console.log("ElasticSearch: OK");
        }
    }, function (error) {
        console.trace(error.message);
    });


router.get("/all", function(req, res) {
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
        res.status(500);
        res.send({});
    });
});

router.get("/", function(req, res) {
    res.send(sidomes.initJSON("abc1234", 2));
});

router.get("/:id", function(req, res) {
    client.search({
        "index": "sidomes",
        body: {
            query: {
                match: {
                    _id: req.params.id
                }
            }
        }
    }).then(function (body) {

        if (body.hits.total > 1) {
            // error 500
            res.status(500);
            res.send({});
        } else if (body.hits.total === 0) {
            // 404
            res.status(404);
            res.send({});
        } else {
            //noinspection Eslint
            res.send(body.hits.hits[0]._source);
        }
    }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send({});
    });
});

router.put("/", function(req, res) {
    var newSidome = req.body;

    if (!newSidome.numsidome) {
        // 'newSidome' sidome come from the web client application

        // fix sidome format
        newSidome.fromTable = true;
        newSidome.hasTwitter = false;

        client.search({
            "index": "sidomes",
            "q": newSidome.id
        }).then(function (body) {

            if (body.hits.total > 1) {
                // multiples results matchs
                // error 500
                res.status(500);
                res.send({});

            } else if (body.hits.total === 0) {
                // 404
                res.status(404);
                res.send({});
            } else {

                // the existing sidome has been found
                // let's update it

                var now = moment();
                newSidome.lastModified = now.unix();

                client.index({
                    index: "sidomes",
                    type: "sidomes",
                    id: newSidome.id,
                    body: newSidome
                }).then(function() {
                    res.status(200);
                    res.send();
                }, function (error) {
                    console.trace(error.message);
                    res.status(500);
                    res.send({});
                });
            }
        }, function (error) {
            console.trace(error.message);
            res.status(500);
            res.send({});
        });
    } else {
        // 'newSidome' sidome come from an mobile application
    }
});

router.post("/", function(req, res) {
    var p = req.body;

    var now = moment();
    p.lastModified = now.unix();

    if (!p.numsidome) {
        // 'p' sidome come from the web client application

        // fix sidome format
        p.fromTable = true;
        p.hasTwitter = false;

        client.index({
            index: "sidomes",
            type: "sidomes",
            id: p.id,
            body: p
        }).then(function(d) {
            if (!d.created) {
                client.search({
                    "index": "sidomes",
                    "q": p.id
                }).then(function (body) {
                    res.status(409);
                    //noinspection Eslint
                    res.send(body.hits.hits[0]._source);
                });
            } else {
                res.status(201);
                res.send({"created": d.created});
            }
        });
    } else {
        // 'p' sidome come from an mobile application
        // search from the 32 sidomes list and construct the associated sidome
    }
});

module.exports = router;
