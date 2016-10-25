/**
* API methods for the "containers*" name space
*/
module.exports = Containers

const ClientInterface = require('../../ClientInterface.js')
const Schemas = require('./schema.js')

function Containers(opts, parent) {
  opts = opts || default_options
  opts.socket = opts.socket || default_options.socket
  Containers.super_.call(this, opts, parent)
}
ClientInterface.inherits(Containers)

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/3-1-containers
* GET /containers/json?all=1&before=8dfafdbc3a40&size=1 HTTP/1.1
*/
Containers.prototype.list = function(qs) {
  const opts = { qs: qs, handle: this.handle.json }
  return this.get('/containers/json', opts, Schemas.list)
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/create-a-container
* POST /containers/create?name=(image name)
*/
Containers.prototype.create = function(name, body) {
  const opts = { qs: { name: name }, json:true, body: body, handle:this.handle.object }
  return this.post('/containers/create', opts, Schemas.create)
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/remove-a-container
* DELETE /containers/(name)?v=1&force=1
* statusCode 204 = no error
*/
Containers.prototype.remove = function(name, qs) {
  const opts = { qs: qs, statusCode: 204, handle: this.handle.empty }
  return this.delete(`/containers/${name}`, opts, Schemas.remove)
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/inspect-a-container
* 
* @param {String} id_or_name Container id or name.
* @param {Object =} Query parameters; accepts size.
* @return {Promise} Object containing low-level information about the container
*/
Containers.prototype.inspect = function(id_or_name, qs) {
  const opts = { qs: qs, handle: this.handle.json }
  return this.get(`/containers/${id_or_name}/json`, opts, Schemas.inspect)
};

/**
*
*/
Containers.prototype.start = function(id_or_name, qs) {
  const opts = { qs:qs, handle:this.handle.empty, statusCode: 204 }
  return this.post(`/containers/${id_or_name}/start`, opts, Schemas.start)
};

/**
*
*/
Containers.prototype.stop = function(id_or_name, qs) {
  const opts = { qs: qs, handle: this.handle.empty, statusCode: 204 }
  return this.post(`/containers/${id_or_name}/stop`, opts, Schemas.stop)
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/list-processes-running-inside-a-container
*/
Containers.prototype.top = function(id_or_name, qs) {
  const opts = { qs: qs, handle: this.handle.json }
  return this.get(`/containers/${id_or_name}/top`, opts, Schemas.top)
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/get-container-logs
* No container with JournalId setup currently
*/
Containers.prototype.logs = function() {
  throw new Error('Unsupported')
};

Containers.prototype.changes = function(name) {
  const opts = { handle: this.handle.json }
  return this.get(`/containers/${name}/changes`, opts)
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/get-container-stats-based-on-resource-usage
* GET /containers/redis1/stats HTTP/1.1
*/
Containers.prototype.stats = function(name, cb) {
  const opts = { qs: null, pipe: false, onData: cb, handle: this.handle.json }

  if(!cb) {
    opts.qs = { stream: 0 }
  } else if(typeof cb === 'function') {
    opts.pipe = true
  }

  return this.get(`/containers/${name}/stats`, opts, Schemas.stats)
};