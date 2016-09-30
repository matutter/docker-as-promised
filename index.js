const Promise = require('bluebird')
const request = require('request')

const clients = require('./lib/clients')

    //uri: 'http://localhost:5000/v2/_catalog/',
    //uri: 'http://unix:/var/run/docker.sock:/images/json',

var engine = new clients.DockerEngine({socket: '/var/run/docker.sock'})
var registry = new clients.DockerRegistry({host: 'localhost', port: 5000})

/*engine.imagePush('localhost:5000/alpine').then( images => {
  console.log(' > ', images)
})
.catch(console.error.bind(console))*/



registry.versionCheck().then( version => {
  console.log(' > ', version)

  return registry.catalog().then(catalog => {
    console.log(catalog)
    if(catalog.repositories) catalog.repositories.forEach(repo => {

      return registry.delete(repo).then( manifest => {
        console.log(`${manifest.name} deleted`)
      })
      /*registry.tags(repo).then(repo => {
        console.log(repo)
        if(repo.tags) repo.tags.forEach(tag => {
          registry.manifests(repo.name, tag).then(manifest => {

          }).catch(console.error.bind(console))
        })
      }).catch(console.error.bind(console))*/


    })
  })

})
.catch(console.error.bind(console))