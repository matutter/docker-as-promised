
const DockerEngine = require('../../lib/clients/DockerEngine.js')


var engine = null

describe(`DockerEngine`, () => {
  /***
  * initialization
  * Test cases for initiating the engine client "new DockerEgnine(...)"
  */
  describe('initialization', () => {
    it(`options { socket: 'unix socket' }`, () => {
      engine = new DockerEngine({ socket: '/var/run/docker.sock' })
    })

    it(`should use '/var/run/docker.sock' as it's default uri`, () => {
      var uri = new DockerEngine().uri.get('')
      assert(~uri.indexOf('/var/run/docker.sock'))
    })
  })

  describe('utilities', () => {
    /**
    * utilities
    * Utilities provided outside of the Docker v1.24 specification
    * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/
    */
    it('DockerEngine.ping checks the connection', () => {
      engine.ping().should.be.fulfilled
    })

    /***
    * All API in the /containers/* namespace
    * specs: https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/3-1-containers
    */
    /**
    * Ignores all properties that SHOULD not appear
    */
    it('should sanitize query string, removing properties not specified in specs', () => {
      engine.containers({foo:'bar'}).should.be.fulfilled
    })
    /**
    * Throws errors on properties that MAY appear
    */
    it(`should throw a TypeError with incorrect qs value types`, () => {
      engine.containers({limit:'NaN'}).should.be.rejectedWith(TypeError)
    })

    it(`should make a request when the querystring parameters are of valid type`, () => {
      return Promise.all([
        engine.containers({limit: 1, all: '0', size: true, since : 'sha256:0123456789ABCDEF'}).should.be.fulfilled,
        engine.ping().should.be.fulfilled
      ])
    })
  })

  describe('3.1 containers', () => {

  })

})