/*eslint-env node*/

var md5 = require("MD5");

function initJSON(badge) {
    "use strict";
    var p =
    {
        "id": badge,
        "civilite": "M.",
        "nom": md5(badge),
        "prenom": md5(md5(badge)),
        "twitter": "@" + md5(md5(badge)) + md5(badge),
        "email": md5(md5(md5(badge))) + "@mail.me",
        "company": md5(md5(md5(md5(md5(badge)))))
    };
    return p;
}

module.exports = {
    getPerson: initJSON
};
