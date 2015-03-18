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

To be able to connect to the twitter REST API, we need to set some environments variables.

```
Consumer Key (API Key),
Consumer Secret (API Secret),
Access Token,
Access Token Secret,
```
are required.

Once you have get theses keys, just export them
```bash
export TWITTER_CONSUMER_KEY="Your Consumer Key (API Key)"
export TWITTER_CONSUMER_SECRET="Your Consumer Secret (API Secret)"
export TWITTER_ACCESS_TOKEN_KEY="Your Access Token"
export TWITTER_ACCESS_TOKEN_SECRET="Your Access Token Secret"
```
And start the Node.js server:
```bash
node bin/www
```

Or in fishshell:
```
env TWITTER_CONSUMER_KEY="Your Consumer Key (API Key)" TWITTER_CONSUMER_SECRET="Your Consumer Secret (API Secret)" \
    TWITTER_ACCESS_TOKEN_KEY="Your Access Token" TWITTER_ACCESS_TOKEN_SECRET="Your Access Token Secret"\
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
  "default":true,
  "visible":true,
  "id":"q1w2e3r4t5y",
  "color":{
    "r":255,
    "g":255,
    "b":255
  },
  "nodes":{
    "node1":{
      "x":-0.87,
      "y":-0.87,
      "z":0.87
    },
    "node2":{
      "x":1.69,
      "y":-1.69,
      "z":1.69
    },
    "node3":{
      "x":1.25,
      "y":1.25,
      "z":1.25
    },
    "node4":{
      "x":-1.25,
      "y":1.25,
      "z":1.25
    },
    "node5":{
      "x":0.77,
      "y":-0.77,
      "z":-0.77
    },
    "node6":{
      "x":-1.63,
      "y":-1.63,
      "z":-1.63
    },
    "node7":{
      "x":-1.63,
      "y":1.63,
      "z":-1.63
    },
    "node8":{
      "x":0.69,
      "y":0.69,
      "z":-0.69
    }
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
## PUT /sidomes/id
```
Content-type: application/json
Accept: application/json
```
### request payload
a sidome representation
### description
We update the sidome in our database

## GET /sidomes/id
### description
Get a specific sidome
### Resp
200 OK

and the sidome Json

OR

404 NOT FOUND

OR

500 SERVER


## PUT /sidomes
### description
We update the sidome in our database
### Resp
200 OK
OR
404 NOT FOUND

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
### RESP
201 CREATED

OR

409 Conflict

## PUT /sidomes
### description
We update the sidome in our database
### Resp
200 OK
OR
404 NOT FOUND
