/*eslint-env node*/
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
            console.log("Please check unassigned_shards");
        } else {
            console.log("ElasticSearch: OK");
        }
    }, function (error) {
        console.trace(error.message);
    });


/* GET persons listing. */
router.get("/", function(req, res) {
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

/* GET one persons from Dorian API*/
router.get("/:id", function(req, res) {

    // TODO DO THE HTTP GET on the Dorian API
    // TODO RETURN 404 if not found
    // TODO remove this mock:
    var p = {
        "id": req.params.id,
        "civilite": "M.",
        "nom": "Doe",
        "prenom": "John",
        "twitter": "@johndoe",
        "email": "john@doe.me"
    };
    res.send(p);
});

/* Create new randoms persons */
router.post("/fill", function(req, res) {
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

/* Create new Person */
router.post("/", function(req, res) {

    // console.log(req);

    // get the json in the request payload
    var p = req.body;

    client.index({
        index: "persons",
        type: "persons",
        id: p.id,
        body: p
    }).then(function(d) {
        if (!d.created) {
            res.status(400);
            res.send({"created": d.created});
        }
        res.status(201);
        res.send({"created": d.created});
    });
});

module.exports = router;
