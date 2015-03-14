# iot-backend
Just a small backend using Node.js &amp; ElasticSearch to handle persons representation and their avatar

## install:
```bash
npm install
```

## Elasticsearch

### get Elasticsearch
[Download]{http://www.elasticsearch.org/download} and unzip/untar the Elasticsearch official distribution.

### lauch the elasticsearch master node
("-f" is for specifing we want logs redirects to the STDOUT)

```bash
bin/elasticsearch -f
```
launch a second node (to ensure to have replicas of datas)
```bash
bin/elasticsearch -f -Des.node.name=Node-2
```

## launch the Node.js server:
```bash
node bin/www
```

The server connects to the elasticsearch master node, and do a quick check.
if everything goes fine, you should read be able to read "ElasticSearch: OK" in the STDOUT, if not check your elasticsearch logs

# API

# Ressource Person
## GET /persons/id
### description
We do a GET on the REST API provided by SIdO organizers, and return it
### Resp
```json
{
    "id": 424242,
    "civilite": "M.",
    "nom": "Doe",
    "prenom": "John",
    "twitter": "@johndoe",
    "email": "john@doe.me"
}
```
OR if the Person is not in the database:
```
HTTP return code 404
```
```json
{}
```

## POST /persons
```
Content-type: application/json
Accept: application/json
```
### request payload
```json
{
    "id": id,
    "civilite": "",
    "nom": "",
    "prenom": "",
    "twitter": "",
    "email": ""
}
```
### description
We add the datas to our own database
### RESP
201 CREATED
```json
{"created": true}
```
OR
409 Conflict
```json
{"created": false}
```

# Ressource Sidome (avatar)
## POST /sidomes
```
Content-type: application/json
Accept: application/json
```
### request payload
```json
{
    "id": id,
    "person": "<Person IRI>",
    "default": true,
    "visible": true,
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
            "faces": {
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
        ...
    }
}
```
### description
We add the sidome to our own database
### Resp
201 CREATED

OR

409 Conflict

# Ressource Sidome (avatar)
## PUT /sidomes/<nobadge>
```
Content-type: application/json
Accept: application/json
```
### request payload
a sidome representation
### description
We update the sidome in our database

# USE CASE
## Get information from the SIdO organisers API
### REQ
GET /persons/id
### RESP
```json
{
    "id": "4243",
    "civilite": "M.",
    "nom": "Doe",
    "prenom": "John",
    "twitter": "@johndoe",
    "email": "john@doe.me"
}
```
## POST theses informations to this backend
### REQ
POST /persons

```json
{
"id": "4243",
"civilite": "M.",
"nom": "Doe",
"prenom": "John",
"twitter": "@johndoe",
"email": "john@doe.me"
}
```
### RESP
201 CREATED
```json
{"created": true}
```
OR
409 Conflict
```json
{"created": false}
```

## POST a new default sidome to this backend
### REQ
```HTTP
POST /sidomes
```
```json
{
    "id": id,
    "person": "<Person IRI>",
    "default": true,
    "visible": true,
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
            "faces": {
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
        ...
    }
}
```
### RESP
201 CREATED

OR

409 Conflict