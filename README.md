# iot-backend
Just a small backend using Node.js &amp; ElasticSearch to handle persons representation, their avatars, and tweets about a specific event on the topic of Web of Things.
## install:
```bash
npm install
```
## Elasticsearch
### get Elasticsearch
[Download]{http://www.elasticsearch.org/download} and unzip/untar the Elasticsearch official distribution.
### lauch the elasticsearch master node
```bash
bin/elasticsearch
```
## Launch the Node.js server:
To be able to connect to the twitter REST API, we need to set some environments variables.
```
Consumer Key (API Key),
Consumer Secret (API Secret),
Access Token,
Access Token Secret,
```
are **required**.
Get theses key [here]{https://apps.twitter.com/}.
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
### Description
We do a GET on the REST API provided by SIdO organizers, and return it
### Response
```json
{
    "id": "42q4dd2a42",
    "civilite": "M.",
    "nom": "Doe",
    "prenom": "John",
    "twitter": "@johndoe",
    "email": "john@doe.me"
}
```
## POST /persons
### description
We add the person entity to our own database
```
Content-type: application/json
Accept: application/json
```
### request payload
```json
{
    "id": "42q4dd2a42",
    "civilite": "M.",
    "nom": "Doe",
    "prenom": "John",
    "twitter": "@johndoe",
    "email": "john@doe.me"
}
```
### Response
```
201 CREATED
```
```json
{"created": true}
```
OR if the person already exists in our database:
```
409 Conflict
```
```json
{"created": false}
```

# Ressource Sidome (avatar)
## POST /sidomes
### description
We add the sidome to our own database
### request payload
```json
{
    "default": true,
    "visible": true,
    "id": "1842c57a991e",
    "color": {
        "r": 255,
        "g": 255,
        "b": 255
    },
    "nodes": {
        "node1": {
            "x": -1.25,
            "y": -1.25,
            "z": 1.25
        },
        "node2": {
            "x": 1.25,
            "y": -1.25,
            "z": 1.25
        },
        "node3": {
            "x": 1.25,
            "y": 1.25,
            "z": 1.25
        },
        "node4": {
            "x": -1.73,
            "y": 1.73,
            "z": 1.73
        },
        "node5": {
            "x": 1.25,
            "y": -1.25,
            "z": -1.25
        },
        "node6": {
            "x": -1.61,
            "y": -1.61,
            "z": -1.61
        },
        "node7": {
            "x": -1.25,
            "y": 1.25,
            "z": -1.25
        },
        "node8": {
            "x": 1.25,
            "y": 1.25,
            "z": -1.25
        }
    },
    "lastModified": 1426688386
}
```
### Response
```
201 CREATED
```
OR
```
409 Conflict
```
## PUT /sidomes
### request payload
An updated sidome representation
### description
We update the sidome in our database
## GET /sidomes/id
### description
Get a specific sidome
### Resp
a sidome Json

# Ressource Tweet
## GET /tweets
### Description
Getting all tweets about the event
### Response
```json
[
    {
        "usr": "doug42",
        "name": "Douglas A",
        "txt": "@toto , WHoo this event is so awesome: come on to the #SIdO event ! #IOT",
        "hashtags":
        [
            {
                "text": "IOT",
                "indices": [125, 129]
            },
            {
                "text": "SIdO",
                "indices": [130, 140]
            }
        ],
        "mentions":
        [
            {
                "screen_name": "toto",
                "name": "Dylan Thomas",
                "id": 461424242,
                "id_str": "654654564",
                "indices": [3, 11]
            }
        ]
    },
    ...
]
```
# Ressource Image
## POST /image/id
id is the id of the Person
### description
Posting an image representation of the sidome to allow the user to receives it by email
### request payload
```
"data:image/png;base64,iVBORw0KG..............."
```

# USE CASE
## Get information from the SIdO organisers API
### Request
```
GET /persons/id
```
### Responses
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
### Request
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
## POST a new default sidome to this backend
### Request
```HTTP
POST /sidomes
```
## Update the sidome
```HTTP
PUT /sidomes
```
