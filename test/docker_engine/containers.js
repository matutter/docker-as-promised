
const DockerEngine = require('../../lib/clients/DockerEngine.js')
const engine = new DockerEngine()

const test_name = 'dap_test_container'
const test_image = 'hello-world'

describe(`createContainer name:${test_name} Image:${test_image}`, ()=> {

  /*before('delete the container if it exists', () => {
    return engine.removeContainer(test_name, {force:1})
      .catch(e => {
        if(e.statusCode != 404)
          throw e
      }).should.be.fulfilled
  })

  it(`should create a container named ${test_name} from ${test_image}`, () => {
    return engine.createContainer(test_name, {Image: test_image}).then(res => {
      assert(res.Id, 'response has no Id')
      assert(res.Warnings.length == 0, `response has Warnings [${res.Warnings.join(',')}]`)
      console.log(res)
    }).catch(e => {
      console.log(e.content)
      throw e
    }).should.be.fulfilled
  })*/
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