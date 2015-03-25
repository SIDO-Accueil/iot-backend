/*eslint-env node*/
"use strict";

var express = require("express");
//noinspection Eslint
var router = express.Router();

/* POST anonPerson */
router.post("/", function(req, res) {
    ++anonPersonCount;
    res.send({"anonPerson": anonPersonCount});
});

router.delete("/", function(req, res) {
    --anonPersonCount;
    res.send({"anonPerson": anonPersonCount});
});

module.exports = router;