/*eslint-env node*/
"use strict";

var Twitter = require("twitter");

if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET ||
    !process.env.TWITTER_ACCESS_TOKEN_KEY || !process.env.TWITTER_ACCESS_TOKEN_SECRET) {

    console.log("Some env variables are missings");
}

//noinspection Eslint
var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

//noinspection Eslint
var params = {screen_name: "nodejs"};

client.get("search/tweets.json?q=%23SIdO&result_type=recent", params, function(error, tweets, response){
    if (!error) {
        console.log(tweets);
    } else {
        console.log(error);
    }
});
