/*eslint-env node*/
/*global __dirname:false*/

function initJSON(badge) {
    "use strict";
    var s =
    {
        "sidome": {
            "default": true, // the sidome is a cube by default
            "visible": true,  // visibilty
            "badge": badge,
            "color": {
                "r": 255,
                "g": 255,
                "b": 255
            },
            "nodes": {
                "node1": {
                    "x": -1,
                    "y": 0,
                    "z": 0,
                    "faces": {       // each faces on where the node is needed
                        "face1": 1,
                        "face2": 4,
                        "face3": 7,
                        "face4": 8
                    }
                },
                "node2": {
                    "x": 0,
                    "y": 0,
                    "z": 1,
                    "faces": {
                        "face1": 1,
                        "face2": 2,
                        "face3": 5,
                        "face4": 7
                    }
                },
                "node3": {
                    "x": 0,
                    "y": 1,
                    "z": 0,
                    "faces": {
                        "face1": 1,
                        "face2": 2,
                        "face3": 3,
                        "face4": 4
                    }
                },
                "node4": {
                    "x": 1,
                    "y": 0,
                    "z": 0,
                    "faces": {
                        "face1": 2,
                        "face2": 3,
                        "face3": 5,
                        "face4": 6
                    }
                },
                "node5": {
                    "x": 0,
                    "y": 0,
                    "z": -1,
                    "faces": {
                        "face1": 3,
                        "face2": 4,
                        "face3": 6,
                        "face4": 8
                    }
                },
                "node6": {
                    "x": 0,
                    "y": -1,
                    "z": 0,
                    "faces": {
                        "face1": 5,
                        "face2": 6,
                        "face3": 7,
                        "face4": 8
                    }
                }
            }
        }
    };
    return s;
}

module.exports = {
    initJSON: initJSON
};
