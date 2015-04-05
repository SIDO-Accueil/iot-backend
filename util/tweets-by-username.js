/*eslint-env node*/
"use strict";

var rp = require("request-promise");

//noinspection Eslint
var Promise = require("bluebird");

var getTweetCountOf = function (username) {
    return new Promise(function (resolve, reject) {
        var queryElastic = rp.post({
            uri: "http://localhost:9200/_search",
            method: "POST",
            json: {
                "query": {
                    "bool": {
                        "must": [],
                        "must_not": [],
                        "should": [{
                            "query_string": {
                                "default_field": "tweets.usr",
                                "query": username
                            }
                        }]
                    }
                },
                "from": 0,
                "size": 10,
                "sort": [],
                "facets": {}
            }
        });

        queryElastic
            .then(function(data) {
                console.log("{id: " + username + ", nbtweets: " + data.hits.total + "}");
                resolve(data.hits.total);
            })
            .catch(function(err) {
                console.error(err);
                console.log("{id: " + username + ", nbtweets: " + err + "}");
                reject(err);
            });
    });
};

module.exports = {
    countof: getTweetCountOf
};
