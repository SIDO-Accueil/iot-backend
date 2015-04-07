/*eslint-env node*/
"use strict";

//noinspection Eslint
var Promise = require("bluebird");
var email = require("emailjs");
var readFile = Promise.promisify(require("fs").readFile);

var smtpParams = {
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PWD,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    tls: process.env.SMTP_TLS,
    ssl: process.env.SMTP_SSL,
    address: process.env.SMTP_ADRESS
};

var getEmailText = function() {
    return new Promise(function (resolve, reject) {

        var templatePath = "./util/template-email/template.txt";
        readFile(templatePath, "utf8").then(function(text) {
            resolve(text);
        }).catch(SyntaxError, function(e) {
            console.log("File had syntax error", e);
            reject(e);
            //Catch any other error
        }).catch(function(e) {
            console.log("Error reading file", e);
            reject(e);
        });
    });
};

var send = function (destFirstName, destLastname, emailAdress, image) {

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

        getEmailText.then(function(txt) {
            // send the message and get a callback with an error or details of the message that was sent
            server.send({
                text: txt,
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
        }).catch(function(e){
            console.err(e);
        })


    });
};


module.exports = {
    send: send
};
