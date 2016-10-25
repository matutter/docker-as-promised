module.exports = DockerEngine

const err = require('../error.js')
const ClientInterface = require('../ClientInterface.js')

const Images = require('./images')
const Containers = require('./containers')
const default_options = { socket: '/var/run/docker.sock' }

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/
*/
function DockerEngine(opts) {
  opts = opts || default_options
  opts.socket = opts.socket || default_options.socket
  DockerEngine.super_.call(this, opts)
  this.images = new Images(opts, this)
  this.containers = new Containers(opts, this)
}
ClientInterface.inherits(DockerEngine)

/**
* Almost all calls require this "Host" header
*/
DockerEngine.prototype.before = function(request_opts) {
  request_opts.headers.Host = this.uri.host()
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/ping-the-docker-server
* GET /_ping HTTP/1.1
* HTTP/1.1 200 OK
* Content-Type: text/plain
* OK
*/
DockerEngine.prototype.ping = function() {
  return this.get('/_ping', { handle: this.handle.text })
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/show-the-docker-version-information
*/
DockerEngine.prototype.version = function() {
  return this.get('/version', { handle:this.handle.json })
};