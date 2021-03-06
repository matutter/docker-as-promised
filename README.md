[![Build Status](https://travis-ci.org/matutter/docker-as-promised.svg?branch=master)](https://travis-ci.org/matutter/docker-as-promised)
[![Coverage Status](https://coveralls.io/repos/github/matutter/docker-as-promised/badge.svg?branch=master)](https://coveralls.io/github/matutter/docker-as-promised?branch=master)
[![dependencies Status](https://david-dm.org/matutter/docker-as-promised/status.svg)](https://david-dm.org/matutter/docker-as-promised)

# docker-as-promised
Docker as promised provides promissory style clients for both the Docker Registry & Engine remote API.

### Example

```javascript
const DockerEngine = require('docker-as-promised').DockerEngine // engine or registry clients

var engine = new DockerEngine({socket: '/var/run/docker.sock'})

engine.images()
.then(images => console.log(images.length, 'images'))
.catch(console.error.bind(console))
```
