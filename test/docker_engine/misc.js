
//const DockerEngine = require('../../lib/clients/DockerEngine.js')
const validates = require('../../lib/validation').engine
const engine = global.engine.instance

describe('query-string & body sanitization removes excess properties', () => {

  const valid_output = {
    containers_list : {
      all : 1,
      limit : 2,
      since: 'sha256:0123456789ABCDEF',
      before: 'sha256:0123456789ABCDEF',
      size: 1,
      filters: {}
    },
    create_container_name : { name: 'name' },
    create_container_body : { Image: '/name' },
    inspect_container : { size: 1 },
    remove_container : { v : 'True', force : false },
    top_container : { ps_args: 'aux' },
    start_container : { detachKeys: 'ctrl-a' },
    stop_container : { t: 0 },
    create_image : { fromImage: 'alpine' }
  }

  const valid_input = {
    containers_list : {
      all : 1, extra:'gets removed',
      limit : 2,
      since: 'sha256:0123456789ABCDEF',
      before: 'sha256:0123456789ABCDEF',
      size: 1,
      filters: {}
    },
    create_container_name : { name: 'name' },
    create_container_body : { Image: '/name' },
    inspect_container : { size: 1 },
    remove_container : { v : 'True', force : false },
    top_container : { ps_args: 'aux' },
    start_container : { detachKeys: 'ctrl-a' },
    stop_container : { t: 0 },
    create_image : { fromImage: 'alpine' }
  }

  for(key in validates) {
    const validator = validates[key]
    const expect = valid_output[key]
    const input = valid_input[key]

    assert(typeof validator === 'function', `validator ${key} not a function. (actual type ${typeof validator})`)
    it(`should sanitize engine.${key}`, () => {
      validator(input).then(result => assert.deepEqual(result, expect)).should.be.fulfilled     
    })
  }
})

describe('query-string & body validation throws errors on invalid types', ()=> {
  const invalid_input = {
    containers_list : {
      all : 'not truthy', extra:'gets removed',
      limit : 'not a number',
      since: '0123456789ABCDEF',
      before: 'sha256:0123456789ABCDEF',
      size: 1,
      filters: {}
    },
    create_container_name : { name: '123 unexpected/name' },
    create_container_body : { Image: 'xxx malformed/name' },
    inspect_container : { size: 'something else' },
    remove_container : { v : 'True+False', force : {} },
    top_container : { ps_args: '--width 0xxx xxx'},
    start_container : { detachKeys: 'xxx' },
    stop_container : { t: 'x' },
    create_image : { fromImage: 123 }
  }

  for(key in validates) {
    const validator = validates[key]
    const input = invalid_input[key]

    assert(typeof validator === 'function', `validator ${key} not a function. (actual type ${typeof validator})`)
    it(`should validate engine.${key}`, () => {
      validator(input).should.be.rejected
    })
  }
})
