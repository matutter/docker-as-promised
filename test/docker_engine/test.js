
const DockerEngine = require('../../lib/clients/DockerEngine.js')
const socket = '/var/run/docker.sock'
const engine = new DockerEngine()
const version = '1.24'

global.engine = {
  socket: '/var/run/docker.sock',
  version: version,
  instance: engine
}

describe(`DockerEngine`, () => {

  describe('ping', () => {
    it('should be reachable', () => {
      return engine.ping().should.be.fulfilled
    })
  })

  describe('version', () => {
    it(`should be ${version}`, () => {
      return engine.version().then(info => {
        assert.equal(info.ApiVersion, version, `API version mismatch | expected ${version}, found ${info.ApiVersion}`)
      }).should.be.fulfilled
    })
  })

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