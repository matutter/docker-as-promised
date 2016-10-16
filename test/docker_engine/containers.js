
const DockerEngine = require('../../lib/clients/DockerEngine.js')
const engine = new DockerEngine()

const test_name = 'dap_test_container'
const test_image = 'alpine'

describe(`createContainer name:${test_name} Image:${test_image}`, ()=> {
  it(`should create a container named ${test_name} from ${test_image}`, () => {
    return engine.createContainer(test_name, {Image: test_image}).then(res => {
      assert(res.Id, 'response has no Id')
      assert(res.Warnings.length == 0, `response has Warnings [${res.Warnings.join(',')}]`)
      console.log(res)
    }).should.be.fulfilled
  })
})

describe('listContainers limit:2', () => {
  it('should list containers', () => {
    return engine.listContainers({limit: 2}).then(list => {
      assert(list.length <= 2)
      assert(list.length != 0, 'There are no containers to test with!')
      // every container has an ID
      assert(list.every(container => container.Id))
    }).should.be.fulfilled
  })
})