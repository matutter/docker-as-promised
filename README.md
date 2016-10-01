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
