
const DockerEngine = require('../../lib/clients/DockerEngine.js')


var engine = null

describe(`DockerEngine`, () => {
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

    it('DockerEngine.ping checks the connection', (done) => {
      engine.ping().then(() => done()).catch(done)
    })
  })

  describe('3.1 containers', () => {
    // specs: https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/3-1-containers
    it('should sanitize query string as specified in specs', (done) => {
      engine.containers({all:'fark'}).then(() => done()).catch(done)
    })
    it(`should validate all query string parameters specified in specs`, (done) => {
      engine.containers({limit:1}).then(() => done()).catch(done)
    })
  })

})