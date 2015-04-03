# iot-backend
Just a small backend using Node.js &amp; ElasticSearch to handle persons representation, their avatars, and tweets about a specific event on the topic of Web of Things.
## install:
```bash
npm install
```
## Elasticsearch
### get Elasticsearch
[Download](http://www.elasticsearch.org/download}) and unzip/untar the Elasticsearch official distribution.
### lauch the elasticsearch master node
```bash
bin/elasticsearch
```
## Launch the Node.js server:
### The configuration fun begins
#### TWITTER
To be able to connect to the twitter REST API, we need to set some environments variables.
```
Consumer Key (API Key),
Consumer Secret (API Secret),
Access Token,
Access Token Secret,
```
are **required**.
Get theses key [here](https://apps.twitter.com/).
Once you have get theses keys, just export them
```bash
export TWITTER_CONSUMER_KEY="Your Consumer Key (API Key)"
export TWITTER_CONSUMER_SECRET="Your Consumer Secret (API Secret)"
export TWITTER_ACCESS_TOKEN_KEY="Your Access Token"
export TWITTER_ACCESS_TOKEN_SECRET="Your Access Token Secret"
```

#### MYSQL
To be able to connect to the SQL database containing users phones statistics,
we need to set some environments variables.
```
MYSQL_URL,
MYSQL_USER,
MYSQL_DATABASE,
MYSQL_PASSWORD,
```
are **required**.
```bash
export MYSQL_URL="example.org"
export MYSQL_USER="username"
export MYSQL_DATABASE="mydatabasename"
export MYSQL_PASSWORD="password"
```

#### SMTP
```
SMTP_USER
SMTP_PWD
SMTP_HOST
SMTP_PORT
SMTP_SSL
SMTP_ADRESS
```
are **required**.
```bash
export SMTP_USER="SMTP username"
export SMTP_PWD="SMTP password"
export SMTP_HOST="URL of the SMTP server"
export SMTP_SSL="true|false"
export SMTP_ADRESS="the email adress we will use to send emails"
```

### The configuration fun is done, let's start the REST API :)
And start the Node.js server:
```bash
node bin/www
```

Or in fishshell without *export*:
```
env TWITTER_CONSUMER_KEY="Your Consumer Key (API Key)"\
    TWITTER_CONSUMER_SECRET="Your Consumer Secret (API Secret)"\
    TWITTER_ACCESS_TOKEN_KEY="Your Access Token"\ 
    TWITTER_ACCESS_TOKEN_SECRET="Your Access Token Secret"\
    MYSQL_URL="example.org"\ 
    MYSQL_USER="username"\
    MYSQL_DATABASE="mydatabasename"\
    MYSQL_PASSWORD="password"\
    SMTP_USER="SMTP username"\
    SMTP_PWD="SMTP password"\
    SMTP_HOST="URL of the SMTP server"\
    SMTP_SSL="true|false"\
    SMTP_ADRESS="the email adress we will use to send emails"\
    node bin/www
```

The server connects to the elasticsearch master node, and do a quick check.
if everything goes fine, you should read be able to read "ElasticSearch: OK" in the STDOUT, if not check your elasticsearch logs

# API
# Ressource Person
## GET /persons/id
### Description
We do a GET on our own database.
### Response
```json
{
    "id": "42q4dd2a42",
    "civilite": "M.",
    "nom": "Doe",
    "prenom": "John",
    "twitter": "@johndoe",
    "email": "john@doe.me",
    "company": "Aperture Science"
}
```
OR 
404 NOT FOUND, if the person not yet exist
## POST /persons/id
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
    "email": "john@doe.me",
    "company": "Aperture Science"
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
## GET /sidomes
### description
Get sidomes to add to the view, to remove to the view, and the count of 
anonymous persons.
### Resp
```
{
    "nb": 10,
    "in": [
        {
            "default": false,
            "visible": true,
            "id": "pkpk",
            "color": {
                "r": 164,
                "g": 40,
                "b": 75
            },
            "nodes": {
                "node1": {
                    "x": -1.97,
                    "y": -1.97,
                    "z": 1.97
                },
                "node2": {
                    "x": 1.25,
                    "y": -1.25,
                    "z": 1.25
                },
                "node3": {
                    "x": 0.71,
                    "y": 0.71,
                    "z": 0.71
                },
                "node4": {
                    "x": -1.25,
                    "y": 1.25,
                    "z": 1.25
                },
                "node5": {
                    "x": 1.25,
                    "y": -1.25,
                    "z": -1.25
                },
                "node6": {
                    "x": -1.25,
                    "y": -1.25,
                    "z": -1.25
                },
                "node7": {
                    "x": -1.99,
                    "y": 1.99,
                    "z": -1.99
                },
                "node8": {
                    "x": 0.55,
                    "y": 0.55,
                    "z": -0.55
                }
            },
            "fromTable": true,
            "hasTwitter": false,
            "lastModified": 1427927998,
            "lastDisplayed": 1427928002
        }
    ],
    "out": [
        {
            "id": "a64b56c45"
        },
        {
            "id": "65465b64c4"
        }
    ]
}
```

## POST /sidomes
### description
We add the sidome to our own database
### request payload
```json

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

# Ressource Stats
## GET /stats
### Response
```json
{
    "iot": 624,
    "sido": 0,
    "objetsconnectes": 0,
    "sidoevent": 0,
    "gmc": 38,
    "innovationdating": 0,
    "sidomesPerso": 12,
    "sidomesTotal": 12,
    "ios": 25.64,
    "win": 3.48,
    "android": 17.54,
    "other": 53.35
}
```

# USE CASE
## Get person information
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
    "email": "john@doe.me",
    "company": "Aperture Science"
}
```
## POST theses informations to this backend
If GET /persons/id had returned 404, the client do a GET on the SIdO organizer REST API, and POST the data to our REST API.
### Request
POST /persons
```json
{
    "id": "4243",
    "civilite": "M.",
    "nom": "Doe",
    "prenom": "John",
    "twitter": "@johndoe",
    "email": "john@doe.me",
    "company": "Aperture Science"
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
# Ressource Anonperson
## POST /anonpersons
Specify the server that a person has been detected by the person sensors
### Response:
```
{"anonPerson": 42}
```
### Comment:
This counting have a side effect on the GET /stats.
If we have 42 anonymous persons, the GET /stats will returns (42 + <the 
number of personalized sidomes) in the field 'sidomesTotal'.

