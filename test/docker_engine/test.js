
const DockerEngine = require('../../lib/clients/DockerEngine.js')
const socket = '/var/run/docker.sock'
var engine = new DockerEngine()

global.engine = {
  socket: '/var/run/docker.sock'
}

describe(`DockerEngine`, () => {
  /***
  * initialization
  * Test cases for initiating the engine client "new DockerEgnine(...)"
  */
  describe('initialization', () => {
    require('./initialize.js')
  })

  /**
  * utilities
  * Utilities provided outside of the Docker v1.24 specification
  * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/
  */
  describe('misc', () => {
    require('./misc.js')
  })

  /**
  * All API in the /containers/* namespace
  * specs: https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/3-1-containers
  */
  describe('3.1 containers', () => {
    require('./containers.js')
  })

})