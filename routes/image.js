/*eslint-env node*/
"use strict";

var express = require("express");
var im = require("imagemagick");
var fs = require("fs");

//noinspection Eslint
var Promise = require("bluebird");

var sendmail = require("../util/sendMail");
var personfind = require("../util/personfind");

//noinspection Eslint
var router = express.Router();

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

        personfind.search(idUsr)
            .then(function(userinfo) {

                fs.writeFile("./sidomes-png/out-" + idUsr + ".png", base64Data, "base64", function(err) {
                    if (err) {
                        console.log(err);
                        console.log("CANNOT WRITE " + "./sidomes-png/out-" + idUsr + ".png");
                    }
                    im.convert(["./sidomes-png/out-" + idUsr + ".png",
                            "-alpha", "set", "-channel", "RGBA",
                            "-fill", "none", "-fuzz", "5%", "-opaque", "#ffffff",
                            "-background", "black", "-alpha", "remove", "-alpha",
                            "set", "-channel", "RGBA", "-fill", "none", "-fuzz",
                            "5%", "-opaque", "black", "./sidomes-png/out-" + idUsr + "fixed.png"], function(err2, stdout){

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
                            sendmail.send(userinfo.firstname, userinfo.lastname, userinfo.email, data)
                                .then(function() {
                                    removeSidomeFile(idUsr);
                                }).catch(function() {
                                    removeSidomeFile(idUsr);
                                });
                        });
                        });
                    });
            })
            .catch(function(err) {
                console.err(err);
                console.err("CANNOT FIND PERSON:", idUsr);
            });
    });

    res.send();
});

module.exports = router;
