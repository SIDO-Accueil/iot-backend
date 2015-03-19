/*eslint-env node*/
"use strict";

var express = require("express");
var elasticsearch = require("elasticsearch");

//noinspection Eslint
var router = express.Router();

// create a client instance of elasticsearch
var client = new elasticsearch.Client({
    host: "localhost:9200",
    log: "trace"
});


// TODO REMOVE THIS CODE DUPLICATION !!!
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


router.post("/:id", function(req, res) {
    var idUsr = req.params.id;

    // Getting all the encoded image chunk by chunk:
    var str = "";
    req.on("data", function (chunk) {
        str += chunk.toString();
    });
    req.on("end", function () {
        console.log(str);
    });
    // in str, now we have the image in "data:image/png;base64,<encodedimagehere>"

    // TODO Create image as PNG ? using imagemagick API ?
    // TODO do request on elasticsearch for getin the email of "idUsr"
    // TODO SEND an email containing the image on attachment, HOW ?? SMTP ... ?? will be painful

    res.send();
});

module.exports = router;
