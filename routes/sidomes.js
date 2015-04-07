/*eslint-env node*/
/*global __dirname:false, anonPersonCount:true*/

"use strict";

var express = require("express");
var moment = require("moment");

var sidomesaddrm = require("../util/sidome-inout-model");
var sidomefactory = require("../util/sidome-factory");
var elasticgetclient = require("../util/elasticsearch-getclient");
var tweetsbyusername = require("../util/tweets-by-username");
var twitterusername = require("../util/twitter-username");
var personfind = require("../util/personfind");
var sendmail = require("../util/sendMail");

var ROTATION_TIME_SEC = 60;

//noinspection Eslint
var router = express.Router();

// get a client instance of elasticsearch
var client = elasticgetclient.get();

var fixSidomeColor = function (sidome) {
    var color = sidome.color;
    color.r = Math.round(color.r, 0);
    color.g = Math.round(color.g, 0);
    color.b = Math.round(color.b, 0);
    return sidome;
};

var updateSidome = function(newSidome, res) {
    var now = moment();
    newSidome.lastModified = now.unix();
    newSidome.visible = false;
    newSidome = fixSidomeColor(newSidome);

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
        res.status(404);
        res.send({});
    });
};

var addSidome = function (sidome, res) {
    var now = moment();
    sidome.lastModified = now.unix();
    sidome.visible = false;
    sidome = fixSidomeColor(sidome);

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
        "size": 10,
        "q": "*"
    }).then(function (body) {

        // get all sidomes !!
        var hits = body.hits.hits;
        var allSidomes = [];
        var sidomesPersoTotal = hits.length;

        // COUNT visibles sidomes
        var sidomesVisiblesTotal = 0;
        allSidomes.forEach(function(x) {
            if(x.visible) {
                ++sidomesVisiblesTotal;
            }
        });
        var ratioSidomesVisibles = sidomesVisiblesTotal / sidomesPersoTotal;
        console.log("ratio visible/persoTotal:" + ratioSidomesVisibles);

        hits.forEach(function(j){
            //noinspection Eslint
            allSidomes.push(j._source);
        });

        // get recently added sidomes from the table
        var recentsToAdd = allSidomes.filter(function(s) {
            if (!s.visible && s.finish) {
                var lastMod = moment.unix(s.lastModified);
                var nowMinus60 = moment().subtract(ROTATION_TIME_SEC, "seconds");
                if (lastMod.isBefore(nowMinus60)) {
                    return false;
                } else {
                    return true;
                }
            }
        });

        var oldToRm = allSidomes.filter(function(s) {
            if (s.visible) {
                var lastDisplayed = moment.unix(s.lastDisplayed);
                var nowMinus60 = moment().subtract(ROTATION_TIME_SEC, "seconds");
                if (lastDisplayed.isBefore(nowMinus60)) {
                    return true;
                } else {
                    return false;
                }
            }
        });

        oldToRm.forEach(function(s) {
            // update each sidome that will be removed at the screen
            s.visible = false;

            client.index({
                index: "sidomes",
                type: "sidomes",
                id: s.id,
                body: s
            }).then(function() {

            }, function (error) {
                console.trace(error.message);
            });
        });

        var oldToRmIds = oldToRm.map(function(s) {
           return {"id": s.id};
        });

        // We takes some old sidomes to add
        allSidomes.forEach(function(s) {
            if (!s.visible && s.finish) {
                var lastMod = moment.unix(s.lastModified);
                var nowMinus60 = moment().subtract(ROTATION_TIME_SEC, "seconds");

                if ( lastMod.isBefore(nowMinus60) &&
                     !oldToRm.some(function(s2) { return s2.id === s.id; }) &&
                     Math.random() > ratioSidomesVisibles
                    ) {
                    // olds ones, not visibles ones, and only if there is not much sidomes shown
                        console.log("old sidome chosen to be shown:" + s.id);
                        recentsToAdd.push(s);
                }
            }
        });

        var promisesAddTweets = [];
        var recentsToAddWithTweets = [];

        recentsToAdd.forEach(function(s) {
            // update each sidome that will be shown at the screen
            s.visible = true;
            s.lastDisplayed = moment().unix();

            promisesAddTweets.push(
                new Promise(function(resolve, reject) {
                    var id = s.id.replace(/^@/, "");
                    twitterusername.getUsername(id)
                        .then(function (username) {
                            tweetsbyusername.countof(username)
                                .then(function (count) {
                                    s.tweets = count;
                                    recentsToAddWithTweets.push(s);
                                    resolve(s);
                                })
                                .catch(function (err) {
                                    console.error(err);
                                    s.tweets = 0;
                                    recentsToAddWithTweets.push(s);
                                    reject(err);
                                });
                        })
                        .catch(function (err) {
                            console.error(err);
                            s.tweets = 0;
                            recentsToAddWithTweets.push(s);
                            reject(err);
                        });
                })
            );

            client.index({
                index: "sidomes",
                type: "sidomes",
                id: s.id,
                body: s
            }).then(function() {

            }, function (error) {
                console.trace(error.message);
            });
        });

        Promise.all(promisesAddTweets).then(function () {
            var ans = sidomesaddrm.responseFactory(anonPersonCount,
                recentsToAddWithTweets, oldToRmIds);
            console.log("we got tweets counts");
            res.send(ans);
        });

    }, function (error) {
        console.trace(error.message);
        res.status(200);
        var ans = sidomesaddrm.responseFactory(anonPersonCount,
            [], []);

        res.send(ans);
    });
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
        res.status(404);
        res.send({"err": "sidome notfound"});
    });
});

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
            }).catch(function() {
                res.send({"err": "sidomefactory(p.id, p.numsidome) FAILURE"});
            });
    }
});

router.post("/", function(req, res) {
    var p = req.body;

    if (!p.numsidome) {
        // 'p' sidome come from the web client application

        // fix sidome format
        p.fromTable = true;
        p.hasTwitter = false;

        if (anonPersonCount > 0) {
            --anonPersonCount;
        }
        addSidome(p, res);
    } else {
        // 'p' sidome come from an mobile application

        // searching the persons informations
        personfind.search(p.id)
            .then(function(userinfo) {

                // get the sidome image
                sidomefactory.getSidomeImage(p.numsidome)
                    .then(function(image) {

                        // send the mail
                        sendmail.send(userinfo.firstname, userinfo.lastname, userinfo.email, image)
                            .then(function() {
                                console.log("mail successfull sended to:", userinfo.email);
                                res.send({});
                            }).catch(function() {
                                console.err("CANNOT send mail to:", userinfo.email);
                                res.send({});
                            });
                    }).catch(function(err) {
                        console.err("CANNOT get image of the sidome number: ", p.numsidome, ", ", err);
                        res.send({});
                    });

            })
            .catch(function(err) {
                console.err(err);
                console.err("CANNOT FIND PERSON:", p.id);
                res.send({});
            });

        // search from the 32 sidomes list and construct the associated sidome
        sidomefactory.getSidome(p.id, p.numsidome)
            .then(function(sidome) {
                addSidome(sidome, res);
            }).catch(function(err) {
                console.err("CANNOT get JSON of the sidome number: ", p.numsidome, ", ", err);
                res.send({});
            });
    }
});

module.exports = router;
