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

router.get("/:id", function(req, res) {
    client.search({
        "index": "sidomes",
        "q": req.params.id
    }).then(function (body) {

        if (body.hits.total > 1) {
            // error 500
            res.status(500);
            res.send();
        } else if (body.hits.total === 0) {
            // 404
            res.status(404);
            res.send();
        } else {
            //noinspection Eslint
            res.send(body.hits.hits[0]._source);
        }
    }, function (error) {
        console.trace(error.message);
        res.send(error.message);
    });
});

router.put("/", function(req, res) {
    var newSidome = req.body;

    client.search({
        "index": "sidomes",
        "q": newSidome.id
    }).then(function (body) {

        if (body.hits.total > 1) {
            // multiples results matchs
            // error 500
            res.status(500);
            res.send();

        } else if (body.hits.total === 0) {
            // 404
            res.status(404);
            res.send();
        } else {

            // the existing sidome has been found
            // let's update it
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
                res.send(error.message);
            });
        }
    }, function (error) {
        console.trace(error.message);
        res.send(error.message);
    });

});


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

router.post("/", function(req, res) {
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
