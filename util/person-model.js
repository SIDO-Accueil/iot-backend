/*eslint-env node*/

function initJSON(badge) {
    "use strict";
    var s =
    {
        "id": badge,
        "civilite": "",
        "nom": "",
        "prenom": "",
        "email": "",
        "telephone": "",
        "adresse": "",
        "code-postal": "",
        "ville": "",
        "pays": "",
        "linkedin": "",
        "twitter": "",
        "entreprise": "",
        "type-entreprise": "",
        "chiffre-affaire": "",
        "nb-salaries": "",
        "secteur": "",
        "service": "",
        "fonction": "",
        "site-web": ""
    };
    return s;
}

module.exports = {
    initJSON: initJSON
};
