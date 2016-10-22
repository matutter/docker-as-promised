const engine = global.engine.instance || (new require('../../lib/clients/DockerEngine.js'))

const required_images = [
  { image: 'alpine' },
  { image: 'registry' },
  { image: 'hello-world' }
]

describe('createImage ...', () => {
  required_images.forEach(required => {

    var image = required.image
    var tag = required.tag || 'latest'

    describe(`createImage fromImage:${image} tag:${tag} stream_cb`, () => {
      it(`should pull ${image} & stream the engine response as objects`, function() {

        this.timeout(1000 * 60 * 5)

        var status = 0

        const onProgress = (data) => {
          if(data.status) status++
        }

        return engine.createImage({fromImage: image, tag:tag}, onProgress)
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