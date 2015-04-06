/*eslint-env node*/
"use strict";

//noinspection Eslint
var Promise = require("bluebird");

var elasticgetclient = require("../util/elasticsearch-getclient");

// get a client instance of elasticsearch
var client = elasticgetclient.get();

var search = function(userid) {
    return new Promise(function(resolve, reject) {
        client.search({
            "index": "persons",
            body: {
                query: {
                    match: {
                        id: userid
                    }
                }
            }
        }).then(function (body) {

            if (body.hits.total === 1) {
                console.log("--------------------email:--------------------------");
                //noinspection Eslint
                console.log(body.hits.hits[0]._source.email);
                //noinspection Eslint
                console.log(body.hits.hits[0]._source.prenom);
                //noinspection Eslint
                console.log(body.hits.hits[0]._source.nom);
                console.log("----------------------------------------------");

                //noinspection Eslint
                var user = {
                    "email": body.hits.hits[0]._source.email,
                    "lastname": body.hits.hits[0]._source.nom,
                    "firstname": body.hits.hits[0]._source.prenom
                };
                resolve(user);

            } else {
                console.err({"err": "multiples persons matches :/"});
                reject({"err": "multiples persons matches :/"});
            }
        }, function (error) {
            console.trace(error.message);
            console.err({"err": "cannot find the person email :/"});
            reject({"err": "cannot find the person email :/"});
        });
    });
};

module.exports = {
    search: search
};
