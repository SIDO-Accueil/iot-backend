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
