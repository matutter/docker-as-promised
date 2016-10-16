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
  return validates.containers_list(query_params)
    .then(qs => this.get('/containers/json', {qs: qs, handle: this.handle.json }))
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/create-a-container
* POST /containers/create?name=(image name)
*/
DockerEngineClient.prototype.createContainer = function(name, body) {
  var qs = { name: name }
  return Promise.all([validates.create_container_name(qs), validates.create_container_body(body)])
    .spread((qs, body) => this.post('/containers/create', {qs:qs, json:body, handle:this.handle.json}))
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/remove-a-container
* DELETE /containers/(name)?v=1&force=1
* statusCode 204 = no error
*/
DockerEngineClient.prototype.removeContainer = function(name, query_params) {
  return validates.remove_container(query_params)
    .then(qs => this.delete(`/containers/${name}`, {qs:qs, statusCode:204, handle:this.handle.empty}))
};

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/inspect-a-container
* 
* @param {String} id_or_name Container id or name.
* @param {Object =} Query parameters; accepts size.
* @return {Promise} Object containing low-level information about the container
*/
DockerEngineClient.prototype.inspectContainer = function(id_or_name, query_params) {
  return validates.inspect_container(query_params)
    .then(qs => this.get(`/containers/${id_or_name}/json`, { qs:qs, handle:this.handle.json }))
};

DockerEngineClient.prototype.getX_Auth_Config = function() {
  return {
    'X-Registry-Auth' : new Buffer(JSON.stringify({
      username: '',
      password: ''
    })).toString('base64')
  }
};

