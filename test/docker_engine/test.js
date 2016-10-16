
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

  /**
  * utilities
  * Utilities provided outside of the Docker v1.24 specification
  * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/
  */
  describe('utilities', () => {
    /**
    * Ignores all properties that SHOULD not appear
    */
    it('should sanitize query string, removing properties not listed in specs', () => {
      engine.listContainers({foo:'bar'}).should.be.fulfilled
    })
    /**
    * Throws errors on properties that MAY appear
    */
    it(`should throw a TypeError with incorrect qs value types`, () => {
      return engine.listContainers({limit:'NaN'}).should.be.rejectedWith(TypeError)
    })

    describe('validators help prevent malformed queries', () => {
      
      describe('engine.listContainers', () => {
        it('validates all, limit, since, before, size, ', () => {
          return engine.listContainers({limit: 1, all: '0', size: true, since : 'sha256:0123456789ABCDEF'}).should.be.fulfilled
        })
      })

      describe('engine.ping', () => {
        it('has no parameters', () => {
          return engine.ping().should.be.fulfilled
        })
      })

    })
  })

  /**
  * All API in the /containers/* namespace
  * specs: https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/3-1-containers
  */
  describe('3.1 containers', () => {
    require('./containers.js')
  })

})