/*eslint-env node*/

function initJSON(badge, sidomesLibres) {
    "use strict";
    var s =
    {
        "nb": sidomesLibres,
        "in": [
            {
                "default": false,
                "visible": true,
                "id": badge,
                "fromTable": false,
                "hasTwitter": false,
                "color": {
                    "r": 190,
                    "g": 27,
                    "b": 33
                },
                "nodes": {
                    "node1": {
                        "x": -2.25,
                        "y": -2.25,
                        "z": 2.25
                    },
                    "node2": {
                        "x": 0.89,
                        "y": -0.89,
                        "z": 0.89
                    },
                    "node3": {
                        "x": 1.99,
                        "y": 1.99,
                        "z": 1.99
                    },
                    "node4": {
                        "x": -1.25,
                        "y": 1.25,
                        "z": 1.25
                    },
                    "node5": {
                        "x": 1.89,
                        "y": -1.89,
                        "z": -1.89
                    },
                    "node6": {
                        "x": -1.25,
                        "y": -1.25,
                        "z": -1.25
                    },
                    "node7": {
                        "x": -1.87,
                        "y": 1.87,
                        "z": -1.87
                    },
                    "node8": {
                        "x": 1.97,
                        "y": 1.97,
                        "z": -1.97
                    }
                }
            }
        ],
        "out": [
            {
                "id": "1a2b3c"
            }
        ]
    };
    return s;
}

module.exports = {
    initJSON: initJSON
};
