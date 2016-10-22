module.exports = DockerEngineClient

const Promise = require('bluebird')
const err = require('./error.js')
const ClientInterface = require('./ClientInterface.js')
const validates = require('../validation').engine

const default_options = { socket: '/var/run/docker.sock' }
/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/
*/
function DockerEngineClient(opts) {
  opts = opts || default_options
  opts.socket = opts.socket || default_options.socket
  DockerEngineClient.super_.call(this, opts)
}
ClientInterface.inherits(DockerEngineClient)

DockerEngineClient.prototype.before = function(opts) {
  opts.headers.Host = this.uri.host()
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/3-1-containers
* GET /containers/json?all=1&before=8dfafdbc3a40&size=1 HTTP/1.1
*/
DockerEngineClient.prototype.listContainers = function(query_params) {
  return this.get('/containers/json', {qs: query_params, handle: this.handle.json }, {qs:validates.containers_list})
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/show-the-docker-version-information
*/
DockerEngineClient.prototype.version = function() {
  return this.get('/version', { handle:this.handle.json })
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/create-a-container
* POST /containers/create?name=(image name)
*/
DockerEngineClient.prototype.createContainer = function(name, body) {
  const validation = { qs: validates.create_container_name, body: validates.create_container_body}
  return this.post('/containers/create', { qs:{ name: name }, json:true, body:body, handle:this.handle.object }, validation)
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/remove-a-container
* DELETE /containers/(name)?v=1&force=1
* statusCode 204 = no error
*/
DockerEngineClient.prototype.removeContainer = function(name, query_params) {
  const validation = { qs: validates.remove_container }
  return this.delete(`/containers/${name}`, {qs:query_params, statusCode:204, handle:this.handle.empty}, validation)
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/inspect-a-container
* 
* @param {String} id_or_name Container id or name.
* @param {Object =} Query parameters; accepts size.
* @return {Promise} Object containing low-level information about the container
*/
DockerEngineClient.prototype.inspectContainer = function(id_or_name, qs) {
  const validation =  { qs: validates.inspect_container }
  return this.get(`/containers/${id_or_name}/json`, { qs:qs, handle:this.handle.json }, validation)
};

/**
*
*/
DockerEngineClient.prototype.startContainer = function(id_or_name, qs) {
  const validation = { qs: validates.start_container }
  return this.post(`/containers/${id_or_name}/start`, { qs:qs, handle:this.handle.empty, statusCode: 204 }, validation)
};

/**
*
*/
DockerEngineClient.prototype.stopContainer = function(id_or_name, qs) {
  const validation = { qs: validates.stop_container }
  return this.post(`/containers/${id_or_name}/stop`, { qs:qs, handle:this.handle.empty, statusCode: 204 }, validation)
};

DockerEngineClient.prototype.createImage = function(qs, cb) {
  const validation = { qs: validates.create_image }
  return this.post('/images/create', { qs:qs, handle:this.handle.empty, pipe: true, onData: cb }, validation)
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/list-processes-running-inside-a-container
*/
DockerEngineClient.prototype.listContainerProcesses = function(id_or_name, qs) {
  const validation = { qs: validates.top_container }
  return this.get(`/containers/${id_or_name}/top`, {qs:qs, handle:this.handle.json}, validation)
};


