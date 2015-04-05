/*eslint-env node*/
"use strict";

var express = require("express");

var elasticgetclient = require("../util/elasticsearch-getclient");
var tweetsbyusername = require("../util/tweets-by-username");

//noinspection Eslint
var router = express.Router();

// get a client instance of elasticsearch
var client = elasticgetclient.get();

router.get("/", function(req, res) {
    client.search({
        "index": "twitter",
        "size": 3000,
        "q": "*"
    }).then(function (body) {

        // get all matchings tweets
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

/* GET tweets listing. */
router.get("/:id", function(req, res) {
    var id = req.params.id;
    tweetsbyusername.countof(id)
        .then(function (count) {
            res.send({"count": count});
        })
        .catch(function (err) {
            console.error(err);
        });
});

module.exports = router;
