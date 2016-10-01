const Promise = require('bluebird')
const request = require('request')

const clients = require('./lib/clients')

    //uri: 'http://localhost:5000/v2/_catalog/',
    //uri: 'http://unix:/var/run/docker.sock:/images/json',

var engine = new clients.DockerEngine({socket: '/var/run/docker.sock'})
var registry = new clients.DockerRegistry({host: 'localhost', port: 5000})

registry.versionCheck().then( version => 
  registry.catalog().then(catalog => 
    Promise.map(catalog.repositories, repo => 
      registry.tags(repo).then(tags => Promise.map(tags, tag => 
        registry.manifestRef(repo, tag).then( manifest => {
          return registry.delete(repo, manifest.digest).then(() => {
            return Promise.map(manifest.layers, layer => registry.deleteBlob(repo, layer.digest))
          })
        })
      ))
    )
  )
)
.catch(e => console.log(e.data || e))

