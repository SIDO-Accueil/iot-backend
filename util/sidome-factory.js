/*eslint-env node*/

var fs = require("fs");
var Promise = require("bluebird");
var readFile = Promise.promisify(require("fs").readFile);

function getSidome(badge, numsidome) {
    "use strict";

    return new Promise(function (resolve, reject) {
        if (numsidome.length <= 1 || numsidome < 10) {
            var numStr = "0" + numsidome;
        } else {
            var numStr = numsidome;
        }

        var sidomePath = "../util/JSONSidomes/" + numStr + ".json";

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
    getSidome: getSidome
};
