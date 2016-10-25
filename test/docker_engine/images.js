const engine = global.engine.instance || (new require('../../lib/clients/DockerEngine.js'))

const required_images = [
  { name: 'alpine' },
  { name: 'registry' },
  { name: 'hello-world' }
]

describe('createImage ...', () => {
  required_images.forEach(required => {

    var image = required.name
    var tag = required.tag || 'latest'

    describe(`createImage fromImage:${image} tag:${tag} stream_cb`, () => {
      it(`should pull ${image} & stream the engine response as objects`, function() {

        this.timeout(1000 * 60 * 5)

        var status = 0

        const onProgress = (data) => {
          if(data.status) status++
        }

        return engine.images.create({fromImage: image, tag:tag}, onProgress)
          .then(result => {
            assert(result === null, 'createImage produced a non-null result: ' + result)
            assert(status > 0, 'createImage observed 0 status objects')
          })
          .catch(e => {
            console.log(e)
            throw e
          }).should.be.fulfilled
      })
    })
  })
})

describe(`inspectImage ...`, () => {

  var image = required_images[0]
  var name = image.name
  var expected_tag = `${name}:${image.tag || 'latest'}`

  describe(`engine.inspectImage(${name})`, () => {
    it(`should return image information for ${name}`, () => {
      return engine.images.inspect(name).then(info => {
        assert(~info.RepoTags.indexOf(expected_tag), `Expected tag "${expected_tag}" not in image ${name}`)
      }).should.be.fulfilled
    })
  })
})