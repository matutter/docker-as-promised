module.exports = DockerEngineClient

const Promise = require('bluebird')
const request = require('request')
const err = require('./error.js')
const uris = require('./uri')

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
* Similar to 'docker images'
*/
DockerEngineClient.prototype.images = function(opts) {
  return this.get('images/json?all=1')
};

DockerEngineClient.prototype.get = function(path, opts) {
  return this.send(Object.assign(opts||{}, { path: path, method: 'GET'}))
}

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