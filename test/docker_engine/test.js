
const DockerEngine = require('../../lib/clients/DockerEngine.js')
const socket = '/var/run/docker.sock'
const engine = new DockerEngine()
const target_ver = '1.24'

var init = true
var misc = true
var images = true
var containers = true
var version = true

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

  if(version) describe('version', () => {
    it(`should be ${target_ver}`, () => {
      return engine.version().then(info => {
        assert.equal(info.ApiVersion, target_ver, `API version mismatch | expected ${target_ver}, found ${info.ApiVersion}`)
      }).should.be.fulfilled
    })
  })

  /***
  * initialization
  * Test cases for initiating the engine client "new DockerEgnine(...)"
  */
  if(init) describe('initialization', () => {
    require('./initialize.js')
  })

  /**
  * utilities
  * Utilities provided outside of the Docker v1.24 specification
  * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/
  */
  if(misc) describe('misc', () => {
    require('./misc.js')
  })

  /**
  * All api in the /images/* namespace
  * specs: https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/images
  * Do this first to pull down all the images we need to test containers
  */
  if(images) describe('3.2 images', () => {
    require('./images.js')
  })

  /**
  * All API in the /containers/* namespace
  * specs: https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/3-1-containers
  */
  if(containers) describe('3.1 containers', () => {
    require('./containers.js')
  })

})