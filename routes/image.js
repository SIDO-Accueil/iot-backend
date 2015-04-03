/*eslint-env node*/
"use strict";

var express = require("express");
var elasticsearch = require("elasticsearch");
var email = require("emailjs");

//noinspection Eslint
var router = express.Router();

// create a client instance of elasticsearch
var client = new elasticsearch.Client({
    host: "localhost:9200",
    log: "trace"
});

var smtpParams = {
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PWD,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    ssl: process.env.SMTP_SSL,
    address: process.env.SMTP_ADRESS
};

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

var sendEmail = function (destFirstName, destLastname, emailAdress, image) {

    console.log(smtpParams);

    var server = email.server.connect({
        user: smtpParams.user,
        password: smtpParams.password,
        host: smtpParams.host,
        port: smtpParams.port,
        ssl: (smtpParams.ssl === "true")
    });

    console.log("send");
    console.log(image);

    // send the message and get a callback with an error or details of the message that was sent
    server.send({
        text: "Merci pour votre participation au SIDO, vous trouverez en pièce jointe votre sidome ! ",
        from: "Sidonie Sido <" + smtpParams.address + ">",
        to: destFirstName + " " + destLastname + "<" + emailAdress + ">",
        subject: "[SIdO] Votre Sidome",
        attachment: [{
            data: image,
            type: "image/png",
            name: "sidome-" + destFirstName + "-" + destLastname + ".png"
        }]
    }, function(err, message) { console.log(err || message); });

};

router.post("/:id", function(req, res) {
    var idUsr = req.params.id;

    // Getting all the encoded image chunk by chunk:
    var str = "";
    req.on("data", function (chunk) {
        str += chunk.toString();
    });
    req.on("end", function () {
        console.log(str);
        // in str, now we have the image in "data:image/png;base64,<encodedimagehere>"
        var base64Data = str.replace(/^data:image\/png;base64,/, "");

        client.search({
            "index": "persons",
            body: {
                query: {
                    match: {
                        id: idUsr
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
                var destEmailAddress = body.hits.hits[0]._source.email;
                //noinspection Eslint
                var destLastname = body.hits.hits[0]._source.nom;
                //noinspection Eslint
                var destFirstName = body.hits.hits[0]._source.prenom;

                require("fs").writeFile("out.png", base64Data, "base64", function(err) {
                    console.log(err);
                });

                require("fs").readFile("out.png", function (err, data) {
                    if (err) throw err;
                    console.log(data);
                    sendEmail(destFirstName, destLastname, destEmailAddress, data);
                });
            } else {
                res.status(400);
                res.send({"err": "multiples persons matches :/"});
            }
        }, function (error) {
            console.trace(error.message);
            res.status(400);
            res.send({"err": "cannot find the person email :/"});
        });
    });

    res.send();
});

module.exports = router;
