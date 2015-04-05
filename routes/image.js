/*eslint-env node*/
"use strict";

var express = require("express");
var email = require("emailjs");
var im = require("imagemagick");
var fs = require("fs");
var Promise = require("bluebird");

var elasticgetclient = require("../util/elasticsearch-getclient");

//noinspection Eslint
var router = express.Router();

// get a client instance of elasticsearch
var client = elasticgetclient.get();

var smtpParams = {
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PWD,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    tls: process.env.SMTP_TLS,
    ssl: process.env.SMTP_SSL,
    address: process.env.SMTP_ADRESS
};

var sendEmail = function (destFirstName, destLastname, emailAdress, image) {

    return new Promise(function (resolve, reject) {
        console.log(smtpParams);

        var server = email.server.connect({
            user: smtpParams.user,
            password: smtpParams.password,
            host: smtpParams.host,
            port: smtpParams.port,
            ssl: (smtpParams.ssl === "true"),
            tls: (smtpParams.tls === "true")
        });

        console.log("send");
        console.log(image);

        // send the message and get a callback with an error or details of the message that was sent
        server.send({
            text: "Merci pour votre participation au SIDO, vous trouverez en pièce jointe votre sidome ! ",
            from: "Sido <" + smtpParams.address + ">",
            to: destFirstName + " " + destLastname + "<" + emailAdress + ">",
            subject: "[SIdO] Votre Sidome",
            attachment: [{
                data: image,
                type: "image/png",
                name: "sidome-" + destFirstName + "-" + destLastname + ".png"
            }]
        }, function(err, message) {
            console.log(err || message);
            if (err) {
                reject(err);
            } else {
                resolve(message);
            }
        });
    });
};

var removeSidomeFile = function (idUsr) {
    fs.unlink("./sidomes-png/out-" + idUsr + "fixed.png", function (err) {
        if (err) {
            console.log(err);
            console.log("FAILED REMOVED ./sidomes-png/out-" + idUsr + "fixed.png");
        } else {
            console.log("SUCCESSFULLY REMOVED ./sidomes-png/out-" + idUsr + "fixed.png");
        }

    });
    fs.unlink("./sidomes-png/out-" + idUsr + ".png", function (err) {
        if (err) {
            console.log(err);
            console.log("FAILED REMOVED ./sidomes-png/out-" + idUsr + ".png");
        } else {
            console.log("SUCCESSFULLY REMOVED ./sidomes-png/out-" + idUsr + ".png");
        }
    });
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

                fs.writeFile("./sidomes-png/out-" + idUsr + ".png",
                    base64Data, "base64", function(err) {
                        if (err) {
                            console.log(err);
                            console.log("CANNOT WRITE " + "./sidomes-png/out-" + idUsr + ".png");
                        }
                        im.convert(["./sidomes-png/out-" + idUsr + ".png",
                                "-alpha", "set", "-channel", "RGBA",
                                "-fill", "none", "-fuzz", "5%", "-opaque", "#ffffff",
                                "-background", "black", "-alpha", "remove", "-alpha",
                                "set", "-channel", "RGBA", "-fill", "none", "-fuzz",
                                "5%", "-opaque", "black", "./sidomes-png/out-" + idUsr + "fixed.png"],
                            function(err2, stdout){
                                if (err2) {
                                    console.log(err2);
                                }
                                console.log("stdout:", stdout);

                                fs.readFile("./sidomes-png/out-" + idUsr + "fixed.png", function (err3, data) {
                                    if (err3) {
                                        console.log(err3);
                                        console.log("CANNOT READ " + "./sidomes-png/out-" + idUsr + "fixed.png");
                                    }
                                    console.log(data);
                                    sendEmail(destFirstName, destLastname, destEmailAddress, data)
                                        .then(function() {
                                            removeSidomeFile(idUsr);
                                        }).catch(function() {
                                            removeSidomeFile(idUsr);
                                        });
                                });
                            });
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
