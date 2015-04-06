/*eslint-env node*/

"use strict";

//noinspection Eslint
var Promise = require("bluebird");
var readFile = Promise.promisify(require("fs").readFile);
var fs = require("fs");

function getSidomeImage(numsidome) {
    return new Promise(function (resolve, reject) {
        var numStr;
        if (numsidome.length <= 1 || numsidome < 10) {
            numStr = "0" + numsidome;
        } else {
            numStr = numsidome;
        }

        var sidomePath = "./util/PNGSidome/" + numStr + ".png";

        fs.readFile(sidomePath, function (err, data) {
            if (err) {
                console.log(err);
                console.log("CANNOT READ " + sidomePath);
                reject(err);
            } else {
                console.log(data);
                resolve(data);
            }
        });
    });
}

function getSidome(badge, numsidome) {

    return new Promise(function (resolve, reject) {
        var numStr;
        if (numsidome.length <= 1 || numsidome < 10) {
            numStr = "0" + numsidome;
        } else {
            numStr = numsidome;
        }

        var sidomePath = "./util/JSONSidome/" + numStr + ".json";

        readFile(sidomePath, "utf8").then(function(sidome) {
            var sidomeAns = JSON.parse(sidome);
            sidomeAns.id = badge;
            resolve(sidomeAns);
        }).catch(SyntaxError, function(e) {
            console.log("File had syntax error", e);
            reject(e);
            //Catch any other error
        }).catch(function(e) {
            console.log("Error reading file", e);
            reject(e);
        });
    });
}

module.exports = {
    getSidomeImage: getSidomeImage,
    getSidome: getSidome
};
