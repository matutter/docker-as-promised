module.exports = DockerEngineClient

const Promise = require('bluebird')
const request = require('request')
const err = require('./error.js')
const uris = require('./uri')
const api = require('./docker_remote_api_v1.24.js')

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/
*/
function DockerEngineClient(opts) {
  this.uri = null

  if(!opts || !(opts.socket || (opts.host && opts.port)))
    throw new Error('Expected options with socket, or host and port properties')

  if(opts.socket) {
    this.uri = new uris.SocketUri(opts.socket)
  } else if(opts.host && opts.port) {
    this.uri = new uris.HttpUri(opts.host, opts.port)
  }

}

/**
* Images
*/

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/3-2-images
*/
DockerEngineClient.prototype.images = function(opts) {
  var qs = api.images.qs(opts)
  return this.get(`images/json?${qs}`)
};

DockerEngineClient.prototype.imageInspect = function(name, opts) {
  return this.get(`images/${name}/json`)
}

DockerEngineClient.prototype.imageHistory = function(name, opts) {
  return this.get(`images/${name}/history`)
}

DockerEngineClient.prototype.imagePush = function(name, opts) {
  var qs = api.imageHistory.qs(opts)
  return this.xAuthPost(`images/${name}/push?${qs}`)
}

/**
* Containers
*/

DockerEngineClient.prototype.containers = function(opts) {
  var qs = api.containers.qs(opts)
  return this.get(`containers/json?${qs}`)
};

DockerEngineClient.prototype.get = function(path, opts) {
  return this.send(Object.assign(opts||{}, { path: path, method: 'GET'}))
}

DockerEngineClient.prototype.xAuthPost = function(path, opts) {
  opts = Object.assign(opts|| {}, { path: path, method: 'POST'})
  opts.headers = Object.assign(opts.headers || {}, this.getX_Auth_Config())
  return this.send(opts)
};

DockerEngineClient.prototype.getX_Auth_Config = function() {
  return {
    'X-Registry-Auth' : new Buffer(JSON.stringify({
      username: '',
      password: ''
    })).toString('base64')
  }
};

DockerEngineClient.prototype.post = function(path, opts) {
  return this.send(Object.assign(opts||{}, { path: path, method: 'POST'}))
};

DockerEngineClient.prototype.send = function(opts) {

  opts = Object.assign(opts, {
    uri: this.uri.get(opts.path),
    headers: { host: this.uri.host }
  })

  return new Promise((resolve, reject) => {
    request(opts, (e, res, body) => {
      if(e) return reject(e)
      return res.statusCode == 200
        ? resolve(JSON.parse(body))
        : reject(new err.ResponseError(res))
    })
  })
}