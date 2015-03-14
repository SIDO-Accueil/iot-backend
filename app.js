/*eslint-env node*/
/*global __dirname:false*/

var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");

var routes = require("./routes/index");
var persons = require("./routes/persons");
var sidomes = require("./routes/sidomes");
var app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);
app.use("/persons", persons);
app.use("/sidomes", sidomes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    "use strict";
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// DEVELOPEMENT MODE
app.set("env", "development");

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
