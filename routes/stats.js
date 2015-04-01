/*eslint-env node*/
"use strict";

var express = require("express");
var elasticsearch = require("elasticsearch");
var rp = require("request-promise");
var mysql = require("mysql");
//noinspection Eslint
var Promise = require("bluebird");

//noinspection Eslint
var router = express.Router();

// create a client instance of elasticsearch
var client = new elasticsearch.Client({
    host: "localhost:9200"
    //log: "trace"
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


var mysqlQueryWrapper = function(connection, query, name) {
    return new Promise(function (resolve, reject) {
        connection.query(query, function(err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(rows[0][name]);
            };
        });
    });
};

// returns a promise
var fillStatsTweets = function(hashtag) {
    return rp.post({
        uri: 'http://localhost:9200/_search',
        method: 'POST',
        json: {
            "query": {
                "bool": {
                    "must":[{
                        "term": {
                            "tweets.hashtags": hashtag
                        }
                    }],
                    "must_not": [],
                    "should": []
                }
            },
            "from": 0,
            "size": 10,
            "sort": [],
            "facets": {}
        }
    });
};

// returns a promise
var fillStatsSidomes = function() {
    return rp.post({
        uri: "http://localhost:9200/sidomes/_search",
        method: "POST",
        json: {}
    });
};

/* GET tweets listing. */
router.get("/", function(req, res) {

    // PHONES
    var connection = mysql.createConnection({
        host: process.env.MYSQL_URL,  // TODO NEED TO DO SOME CHECKS
        user: process.env.MYSQL_USER,
        database: process.env.MYSQL_DATABASE,
        password: process.env.MYSQL_PASSWORD
    });
    connection.connect();
    var queryIos =
        "SELECT Round((count(manufacturer) / (SELECT count(manufacturer) " +
        "FROM sniffer WHERE seen_last_half_day = 1) * 100),2) AS \"ios\" " +
        "FROM sniffer WHERE manufacturer like \"Apple%\" " +
        "AND seen_last_half_day = 1;";
    var queryWin =
        "SELECT Round((count(manufacturer) / (SELECT count(manufacturer) " +
        "FROM sniffer WHERE seen_last_half_day = 1) * 100),2) AS \"win\"" +
        "FROM sniffer WHERE (manufacturer LIKE \"%Microsoft%\" " +
        "OR manufacturer LIKE \"%Nokia%\") AND seen_last_half_day = 1;";
    var queryAndroid =
        "SELECT Round((count(manufacturer) / (SELECT count(manufacturer) " +
        "FROM sniffer WHERE seen_last_half_day = 1) * 100),2) AS \"android\"" +
        "FROM sniffer WHERE (manufacturer LIKE \"%Sony%\" OR" +
        " manufacturer LIKE \"%HUAWEI%\" " +
        "OR manufacturer LIKE \"%Samsung%\" OR manufacturer LIKE \"%LG%\" OR " +
        "manufacturer LIKE \"%HTC%\") AND seen_last_half_day = 1;";
    var queryOther =
        "SELECT Round((count(manufacturer) / (SELECT count(manufacturer)" +
        "FROM sniffer WHERE seen_last_half_day = 1) * 100),2) " +
        "AS \"other\" FROM sniffer" +
        " WHERE manufacturer NOT LIKE \"%Apple%\" " +
        "AND manufacturer NOT LIKE \"%Nokia%\" AND " +
        "manufacturer NOT LIKE \"%Microsoft%\" " +
        "AND manufacturer NOT LIKE \"%Sony%\" " +
        "AND manufacturer NOT LIKE \"%HUAWEI%\" " +
        "AND manufacturer NOT LIKE \"%Samsung%\" " +
        "AND manufacturer NOT LIKE \"%LG%\" " +
        "AND manufacturer NOT LIKE \"%HTC%\" AND seen_last_half_day = 1;";

    // TWEETS
    var output = {};
    var promises = [];
    var hashtags = [
        //"javascript", "angularjs", "backbone", "scala", "browserify", "iojs", "java", "apple"
        "iot", "sido", "objetsconnectes", "sidoevent", "gmc", "innovationdating"
    ];
    hashtags.forEach(function(ht) {
        promises.push(fillStatsTweets(ht));
    });

    // SIDOMES
    var sidomesStats = fillStatsSidomes();

    Promise.all(promises).then(function(results) {
        for (var i = 0; i < promises.length; ++i) {
            var total = results[i].hits.total;
            output[hashtags[i]] = total;
        }
        sidomesStats.then(function(sidomesStatsRes) {
            output['sidomesPerso'] = sidomesStatsRes.hits.total;
            output['sidomesTotal'] = sidomesStatsRes.hits.total + anonPersonCount;

            Promise.props({
                ios: mysqlQueryWrapper(connection, queryIos, 'ios'),
                win: mysqlQueryWrapper(connection, queryWin, 'win'),
                android: mysqlQueryWrapper(connection, queryAndroid, 'android'),
                other: mysqlQueryWrapper(connection, queryOther, 'other')
            }).then(function(phonesStats) {
                console.log(phonesStats);
                connection.end();

                output['ios'] = phonesStats['ios'];
                output['win'] = phonesStats['win'];
                output['android'] = phonesStats['android'];
                output['other'] = phonesStats['other'];
                res.send(output);
            }).catch(function(err) {
                console.log(err);
                res.status(500);
                res.send(err);
            });

        }).catch(function(err) {
            console.error(err);
            res.status(500);
            res.send({});
        });
    }).catch(function(err) {
        console.error(err);
        res.status(500);
        res.send({});
    });
});

module.exports = router;
