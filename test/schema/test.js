/*
* TODO: Define "schemas" for requests with sealed objects.
*/

const Schema = require(__schemas).Schema

describe('Schema', () => {
  it('is exported', () => {
    assert(typeof Schema === 'function')
  })

  const TestSchema = new Schema('test', {
    test: { type: Boolean, required: true },
    name: { type: String, default: 'testname' },
    optional: String
  })

  describe('Schema.validate', () => {
    it('should return a copy of the object if valid', () => {
      var expect = { test: true, name: 'xxx' }
      var result = TestSchema.validate(expect)
      assert.deepEqual(result, expect)      
    })

    it('should assign defaults when missing', () => {
      var expect = { test: true, name: 'testname' }
      var result = TestSchema.validate({test: true})
      assert.deepEqual(result, expect)      
    })

    it('should throw if there is a property not in the schema', () => {
      assert.throws(() => TestSchema.validate( { test: true, name: 'xxx', extra: 'xxx' }))
    })

    it('should throw if a required property is not present', () => {
      assert.throws(() => TestSchema.validate( { name: 'xxx' }))
    })

    it('should throw when the Type.typecheck function fails', () => {
      assert.throws(() => TestSchema.validate( { name: 123 }))
    })
  })
})