/*eslint-env node*/
/*global __dirname:false*/
"use strict";

var express = require("express");
var elasticsearch = require("elasticsearch");
var moment = require("moment");

var sidomesaddrm = require("../util/sidome-inout-model");
var sidomefactory = require("../util/sidome-factory").getSidome;

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

        // get all sidomes
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
    client.search({
        "index": "sidomes",
        "size": 10000,
        "q": "*"
    }).then(function (body) {

        // get all sidomes !!
        var hits = body.hits.hits;
        var allSidomes = [];

        hits.forEach(function(j){
            //noinspection Eslint
            allSidomes.push(j._source);
        });

        // get recently added sidomes from the table
        var fromTableToAdd = allSidomes.filter(function(s) {
            if (s.fromTable && !s.visible) {
                var lastMod = moment.unix(s.lastModified);
                var nowMinus20 = moment().subtract(60, "seconds");
                if (lastMod.isBefore(nowMinus20)) {
                    return false;
                } else {
                    return true;
                }
            }
        });

        //noinspection Eslint
        var ans = sidomesaddrm.responseFactory(anonPersonCount,
                                               fromTableToAdd, []);

        res.send(ans);
    }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send({});
    });

    //res.send(sidomes.initJSON("abc1234", 2));
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

var updateSidome = function(newSidome, res) {
    var now = moment();
    newSidome.lastModified = now.unix();
    newSidome.visible = false;

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
};

router.put("/", function(req, res) {
    var p = req.body;

    if (!p.numsidome) {
        // 'newSidome' sidome come from the web client application
        var newSidome = p;

        // fix sidome format
        newSidome.fromTable = true;
        newSidome.hasTwitter = false;

        updateSidome(newSidome, res);
    } else {
        // 'newSidome' sidome come from an mobile application
        sidomefactory(p.id, p.numsidome)
            .then(function(sidome) {
                updateSidome(sidome, res);
            }).catch(function(err) {
                res.send(err);
            });
    }
});

var addSidome = function (sidome, res) {
    var now = moment();
    sidome.lastModified = now.unix();
    sidome.visible = false;

    client.index({
        index: "sidomes",
        type: "sidomes",
        id: sidome.id,
        body: sidome
    }).then(function(d) {
        if (!d.created) {
            client.search({
                "index": "sidomes",
                "q": sidome.id
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
};

router.post("/", function(req, res) {
    var p = req.body;

    if (!p.numsidome) {
        // 'p' sidome come from the web client application

        // fix sidome format
        p.fromTable = true;
        p.hasTwitter = false;

        addSidome(p, res);
    } else {
        // 'p' sidome come from an mobile application
        // search from the 32 sidomes list and construct the associated sidome
        sidomefactory(p.id, p.numsidome)
            .then(function(sidome) {
                addSidome(sidome, res);
            }).catch(function(err) {
                res.send(err);
            });
    }
});

module.exports = router;
