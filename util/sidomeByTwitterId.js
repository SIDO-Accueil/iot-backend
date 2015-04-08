/*eslint-env node*/

"use strict";

var rp = require("request-promise");

//noinspection Eslint
var Promise = require("bluebird");

var sidomeByTwitterId = function(twitterid) {
    return new Promise(function (resolve, reject) {
        setTimeout(function() {
            var queryElastic = rp.post({
                uri: "http://localhost:9200/sidomes/_search",
                method: "POST",
                json: {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "wildcard": {
                                        "sidomes.twitterid": "*" + twitterid.toLowerCase() + "*"
                                    }
                                }
                            ],
                            "must_not": [ ],
                            "should": [ ]
                        }
                    },
                    "from": 0,
                    "size": 10000,
                    "sort": [ ],
                    "facets": { }
                }

            });

            queryElastic
                .then(function(data) {
                    if (data.hits.total === 1) {
                        //noinspection Eslint
                        resolve(data.hits.hits[0]._source);
                    }
                    else if (data.hits.total >= 1) {
                        var rand = (Math.round(Math.random() * 100) % data.hits.total);
                        //noinspection Eslint
                        resolve(data.hits.hits[rand]._source);
                    }
                })
                .catch(function(err) {
                    reject(err);
                });
        }, 20); // 10 sec range to avoid too much request at the same time
    });
};

var sidomeByTwitterIdDelay = function(twitterid) {
    return new Promise(function (resolve, reject) {
        setTimeout(function() {
            var queryElastic = rp.post({
                uri: "http://localhost:9200/sidomes/_search",
                method: "POST",
                json: {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "wildcard": {
                                        "sidomes.twitterid": "*" + twitterid.toLowerCase() + "*"
                                    }
                                }
                            ],
                            "must_not": [ ],
                            "should": [ ]
                        }
                    },
                    "from": 0,
                    "size": 10000,
                    "sort": [ ],
                    "facets": { }
                }

            });

            queryElastic
                .then(function(data) {
                    if (data.hits.total === 1) {
                        //noinspection Eslint
                        resolve(data.hits.hits[0]._source);
                    }
                    else if (data.hits.total >= 1) {
                        var rand = (Math.round(Math.random() * 100) % data.hits.total);
                        //noinspection Eslint
                        resolve(data.hits.hits[rand]._source);
                    }
                })
                .catch(function(err) {
                    reject(err);
                });
        }, Math.random() * 10000); // 10 sec range to avoid too much request at the same time
    });
};

module.exports = {
    sidomeByTwitterId: sidomeByTwitterId,
    sidomeByTwitterIdDelay: sidomeByTwitterIdDelay
};
