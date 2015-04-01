/*eslint-env node*/

function responseFactory(sidomesLibres, add, rm) {
    "use strict";

    // add is an array of sidomes in the format specified in 'oneSidomeFactory'
    // rm is an array of object like this : [{"id": "1a2b3c"}, ]
    var s = {
            "nb": sidomesLibres,
            "in": add,
            "out": rm
    };
    return s;
}

module.exports = {
    responseFactory: responseFactory
};
