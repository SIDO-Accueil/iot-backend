/*eslint-env node*/
/*global __dirname:false*/

"use strict";

var rp = require("request-promise");
//noinspection Eslint
var Promise = require("bluebird");
var elasticgetclient = require("../util/elasticsearch-getclient");
var sidomeByTwitterId = require("../util/sidomeByTwitterId");

// get a clientTwitt instance of elasticsearch
var client = elasticgetclient.get();

var express = require("express");
//noinspection Eslint
var router = express.Router();

router.patch("/twittertosidome", function(req, res) {
    client.search({
        "index": "persons",
        "size": 10000,
        "q": "*"
    }).then(function (body) {

        // get all matchings persons
        var hits = body.hits.hits;
        var persons = [];

        hits.forEach(function(j){
            //noinspection Eslint
            persons.push(j._source);
        });

        // persons <- all persons
        persons.forEach(function(p) {
            if(p.twitter) {
                var fixedTwitterId = p.twitter.replace(/[^ ]*\//, "").replace(/@/, "").replace(/[^@]*@/, "");
                console.log(fixedTwitterId);

                var personId = p.id;

                client.search({
                    "index": "sidomes",
                    body: {
                        query: {
                            match: {
                                id: personId
                            }
                        }
                    }
                }).then(function (sidomesFound) {
                    if (sidomesFound.hits.total === 1) {
                        //noinspection Eslint
                        var sidome = sidomesFound.hits.hits[0]._source;
                        console.log(sidome.id);

                        // ADD THE TWITTER ID to to corresponding sidome
                        sidome.twitterid = fixedTwitterId;
                        sidome.nbtweets = 0;
                        console.log("update");

                        // Update the database
                        client.index({
                            index: "sidomes",
                            type: "sidomes",
                            id: sidome.id,
                            body: sidome
                        }).then(function() {

                        }, function (error) {
                            console.trace(error.message);
                        });

                    }
                }, function (error) {
                    console.trace(error.message);
                    res.status(404);
                    res.send({"err": "sidome notfound"});
                });
            }
        });

        res.send({});
    }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send({});
    });
});

// iterate over tweets and update each sidome.nbtweets
router.patch("/foreachtweetstosidome", function(req, res) {
    client.search({
        "index": "twitter",
        "type": "tweets",
        "size": 10000,
        "q": "*"
    }).then(function (body) {

        // get all matchings tweets
        var hits = body.hits.hits;
        var tweets = [];

        hits.forEach(function(j){
            //noinspection Eslint
            tweets.push(j._source);
        });

        // persons <- all persons
        tweets.forEach(function(t) {
            console.log(t.usr + "," + t.txt);
            var tweetAuthor = t.usr;
            var tweetTxt = t.txt;

            sidomeByTwitterId.sidomeByTwitterId(tweetAuthor).then(function(sidomeMatching) {
                console.log("sidome: " + sidomeMatching.id);
                sidomeMatching.nbtweets += 1;

                // Update the database
                client.index({
                    index: "sidomes",
                    type: "sidomes",
                    id: sidomeMatching.id,
                    body: sidomeMatching
                }).then(function() {
                    console.log("updated:)");
                }, function (error) {
                    console.trace(error.message);
                });

            }).catch(function(err) {
                console.log(err);
            });
        });
    });
    res.send({});
});

module.exports = router;
