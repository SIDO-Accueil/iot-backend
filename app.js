/*eslint-env node*/
/*global __dirname:false*/

var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var fs = require('fs');

var routes = require("./routes/index");
var persons = require("./routes/persons");
var sidomes = require("./routes/sidomes");
var tweets = require("./routes/tweets");
var image = require("./routes/image");
var stats = require("./routes/stats");

var app = express();

// Twitter stream to the ElasticSearch database
var tweetstream = require("./util/tweetstream.js");

// get the stream of tweets on the database
tweetstream.getStreams();

// CORS enable
app.use(function(req, res, next) {
    "use strict";
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    next();
});

// LOGS
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})
app.use(logger("common", {stream: accessLogStream}));

// PARSERS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// STATIC CONTENTS
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);
app.use("/persons", persons);
app.use("/sidomes", sidomes);
app.use("/tweets", tweets);
app.use("/image", image);
app.use("/stats", stats);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    "use strict";
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// DEVELOPEMENT MODE
app.set("env", "production");

// json pretty print (TODO remove me in production)
if (app.get("env") === "development") {
    app.set("json spaces", 2);
}

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
    app.use(function(err, req, res, next) {
        "use strict";
        res.status(err.status || 500);
        res.render("error", {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    "use strict";
    res.status(err.status || 500);
    res.render("error", {
        message: err.message,
        error: {}
    });
});

module.exports = app;
