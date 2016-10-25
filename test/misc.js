

describe('misc', () => {
  describe('Container / image name regex', () => {

    it(`should match /asd and not "/asd "`, () => {
      var result = /^\/?[a-zA-Z0-9_-]+$/.test("/name")
      assert(result)
      result = /^\/?[a-zA-Z0-9_-]+$/.test("/name ")
      assert(!result)
    })
  })
})

