/*eslint-env node*/
"use strict";

var express = require("express");
//noinspection Eslint
var router = express.Router();
var elasticgetclient = require("../util/elasticsearch-getclient");

// get a client instance of elasticsearch
var client = elasticgetclient.get();

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
        res.status(500);
        res.send({});
    });
});

router.get("/:id", function(req, res) {

    client.search({
        "index": "persons",
        body: {
            query: {
                match: {
                    id: req.params.id
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
        res.status(404);
        res.send({});
    });
});

/* Create new Person */
router.post("/:id", function(req, res) {

    // get the json in the request payload
    var p = req.body;

    var id;
    if (!req.body.id) {
        id = req.params.id;
        p.id = id;
    } else if (req.body.id && req.body.id !== req.params.id) {
        res.status(400);
        res.send({"error": "ids dont matchs"});
    }

    client.index({
        index: "persons",
        type: "persons",
        id: id,
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
