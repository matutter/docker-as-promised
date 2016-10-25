/**
* API methods for the "images*" name space
*/
module.exports = Images

const ClientInterface = require('../../ClientInterface.js')

function Images(opts, parent) {
  opts = opts || default_options
  opts.socket = opts.socket || default_options.socket
  Images.super_.call(this, opts, parent)
}
ClientInterface.inherits(Images)


Images.prototype.create = function(qs, cb) {
  const opts = { qs:qs, handle: this.handle.empty, pipe: true, onData: cb }
  return this.post('/images/create', opts)
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/inspect-an-image
* GET /images/example/json HTTP/1.1
*/
Images.prototype.inspect = function(name) {
  return this.get(`/images/${name}/json`)
};