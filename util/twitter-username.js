/*eslint-env node*/
"use strict";

var rp = require("request-promise");

//noinspection Eslint
var Promise = require("bluebird");

var getTwitterUsername = function (id) {
    return new Promise(function (resolve, reject) {
        var queryElastic = rp.post({
            uri: "http://localhost:9200/_search",
            method: "POST",
            json: {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "term": {
                                    "persons.id": id
                                }
                            }
                        ],
                        "must_not": [ ],
                        "should": [ ]
                    }
                },
                "from": 0,
                "size": 10,
                "sort": [ ],
                "facets": { }
            }
        });

        queryElastic
            .then(function(data) {
                //noinspection Eslint
                console.log("{id: " + id + ", Twitterusername: " +
                        data.hits.hits[0]._source.twitter + "}");
                //noinspection Eslint
                resolve(data.hits.hits[0]._source.twitter);
            })
            .catch(function(err) {
                console.error(err);
                console.log("{id: " + id + ", Twitterusername: " + err + "}");
                reject(err);
            });
    });
};

module.exports = {
    getUsername: getTwitterUsername
};
