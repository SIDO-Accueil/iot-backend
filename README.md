# iot-backend
Just a small backend using Node.js &amp; ElasticSearch to handle users representation and their avatar

## install:
```
npm install
```

## lauch the elasticsearch master node ("-f" to specify we want logs on the STDOUT)
```sh
bin/elasticsearch -f
```
launch a second node (to ensure to have replicas of datas)
```
bin/elasticsearch -f -Des.node.name=Node-2
```

## launch the Node.js server:
```
node bin/www
```

The server connects to the elasticsearch master node, and do a quick check.
if everything goes fine, you should read be able to read "ElasticSearch: OK" in the stdout, if not check your elasticsearch logs