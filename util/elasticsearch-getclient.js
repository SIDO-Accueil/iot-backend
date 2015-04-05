/*eslint-env node*/
"use strict";

var elasticsearch = require("elasticsearch");

var client = new elasticsearch.Client({
    host: "localhost:9200",
    log: {
        type: "file",
        level: "trace",
        path: "../logs/elasticsearch-nodejs.log"
    }
});

console.log("singleton elasticsearch client created");

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

var getclient = function () {
    console.log("------------------get elastic client-------------------------");
    console.log(client);
    console.log("------------------------------------------------------------");
    return client;
};

module.exports = {
    get: getclient
};
