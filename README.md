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

## API
### Create a new person with a default sidome
#### req
```HTTP
POST /persons
```
#### resp
```HTTP
Location : <URL of the new person>
{"created": "ok"}
```

### Get all persons representations
#### req
```HTTP
GET /persons
```
#### resp
```HTTP
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
```
```json
[
  {
    "_index": "persons",
    "_type": "personAndAvatar",
    "_id": "1",
    "_score": 1,
    "_source": {
      "_id": 1,
      "name": "John Doe",
      "twitter": {
        "twitterId": "@devnull",
        "lastTweet": 1425511145
      }
    }
  }
]
```


# Ressource Person
## GET /persons/<nobadge>
### description
We do a GET on the REST API provided by SIdO organizers, and return it
### Resp
```json
{
    "id": "<nobadge>",
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
    "chiffre-affaire":"",
    "nb-salaries": "",
    "secteur": "",
    "service": "",
    "fonction": "",
    "site-web": ""
}
```
OR if the Person is not in the database:
```
HTTP return code 404
```
```json
{}
```

## POST /persons/<nobadge>
```
Content-type: application/json
Accept: application/json
```
### request payload
```json
{
    "id": "<nobadge>",
    "civilite": "",
    "nom": "",
    "prenom": "",
    "twitter": "",
    "email": ""
}
```
### description
We add the datas to our own database
### Resp
201 CREATED
```json
{
  "created": true
}
```
## POST /persons/fill (DEV ONLY)
```
Accept: application/json
```
### description
We some random persons in our database

# Ressource Sidome (avatar)
## POST /sidomes/<nobadge>
```
Content-type: application/json
Accept: application/json
```
### request payload
```json
{
    "id": "<nobadge>",
    "id": "<Person IRI>",
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
```
### description
We add the sidome to our own database
### Resp
201 CREATED
same json as the entry

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
## POST /sidomes/fill (DEV ONLY)
```
Accept: application/json
```
### description
We some random sidomes in our database

