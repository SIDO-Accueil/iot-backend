/*eslint-env node*/
/*global __dirname:false*/

//add timestamps in front of log messages
require("console-stamp")(console, "isoDateTime");

var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var fs = require("fs");

var routes = require("./routes/index");
var persons = require("./routes/persons");
var sidomes = require("./routes/sidomes");
var tweets = require("./routes/tweets");
var image = require("./routes/image");
var stats = require("./routes/stats");
var anonPersons = require("./routes/anonPerson");

var app = express();

// Twitter stream to the ElasticSearch database
var tweetstream = require("./util/tweetstream.js");

// get the stream of tweets on the database
var hashtags = [
    "iot", "sido", "objetsconnectes", "sidoevent", "gmc", "innovationdating"
    //"javascript", "angularjs", "backbone", "scala", "browserify", "iojs", "java", "apple"
];
var lang = "fr";
tweetstream.getStreams(hashtags, lang);

// CORS enable
app.use(function(req, res, next) {
    "use strict";
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Headers",
               "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    next();
});

// LOGS
// create a write stream (in append mode)
//noinspection Eslint
var accessLogStream = fs.createWriteStream(__dirname + "/logs/access.log",
    {flags: "a"});
logger.format('mydate', function() {
    var df = require('console-stamp/node_modules/dateformat');
    return df(new Date(), "isoDateTime");
});
app.use(logger('[:mydate] :method :url :status :res[content-length] - :remote-addr - :response-time ms', {stream: accessLogStream}));

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
app.use("/anonpersons", anonPersons);

// global anonperson counter
//noinspection Eslint
anonPersonCount = 0; //TODO UGLY global variable !!!

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
    app.use(function(err, req, res) {
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
app.use(function(err, req, res) {
    "use strict";
    res.status(err.status || 500);
    res.render("error", {
        message: err.message,
        error: {}
    });
});

module.exports = app;
