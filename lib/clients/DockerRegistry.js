module.exports = DockerRegistry

const Promise = require('bluebird')
const request = require('request')
const err = require('./error.js')
const uris = require('./uri')

function DockerRegistry(opts) {
  this.uri = null

  if(!opts || !(opts.host && opts.port))
    throw new Error('Expected options with host and port properties')

  this.uri = new uris.HttpUri(opts.host, opts.port, 'v2')
}

DockerRegistry.prototype.versionCheck = function() {
  return this.get('')
};

DockerRegistry.prototype.catalog = function() {
  return this.get('_catalog/')
};

DockerRegistry.prototype.tags = function(name) {
  return this.get(`${name}/tags/list`)
};

DockerRegistry.prototype.get = function(path, opts) {
  return this.send(Object.assign(opts||{}, { path: path, method: 'GET'}))
}

// https://docs.docker.com/registry/spec/api/
DockerRegistry.prototype.manifests = function(name, ref) {
  return this.get(`${name}/manifests/${ref}`, { Host: this.uri.host })
};

DockerRegistry.prototype.deleteLayer = function(name, digest) {
  digest = digest.replace(/^.*?:/, '') // remove sha256:
  digest = encodeURIComponent(digest)
  name = encodeURIComponent(name)
  return this.send({
    path: `${name}/blobs/${digest}`,
    method: 'DELETE',
    headers: {
      Host: this.uri.host
    },
    responseCode: 202
  })
};

DockerRegistry.prototype.delete = function(name) {
  return this.tags(name)
    .then(tags => tags.tags)
    .then(tags => tags.map(tag => this.manifests(name, tag)))
    .then(Promise.all)
    .then(manifests =>  Promise.map(manifests
      .map(manifest => manifest.fsLayers)
      .reduce((a,b) => a.concat(b))
      .map(fslayer => fslayer.blobSum ),
        digest => this.deleteLayer(name, digest)))
    .then(Promise.all)
  .then(r => ({ name: r }))
};

DockerRegistry.prototype.send = function(opts) {
  opts = Object.assign(opts, {
    uri: this.uri.get(opts.path),
  })
  console.log(' > ', opts.method, opts.uri)
  return new Promise((resolve, reject) => {
    request(opts, (e, res, body) => {
      if(e) return reject(e)
      return res.statusCode == 200 || res.statusCode == opts.responseCode
        ? resolve(JSON.parse(body))
        : reject(new err.ResponseError(res))
    })
  })
}