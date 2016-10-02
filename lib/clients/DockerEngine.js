module.exports = DockerEngineClient

const err = require('./error.js')
const ClientInterface = require('./ClientInterface.js')

const defualt_options = { socket: '/var/run/docker.sock' }
/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/
*/
function DockerEngineClient(opts) {
  opts = opts || defualt_options
  opts.socket = opts.socket || defualt_options.socket
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
DockerEngineClient.prototype.containers = function(query_params) {
  return this.get('/containers/json', {qs: query_params, resolver: this.resolve.json })
};


DockerEngineClient.prototype.getX_Auth_Config = function() {
  return {
    'X-Registry-Auth' : new Buffer(JSON.stringify({
      username: '',
      password: ''
    })).toString('base64')
  }
};

