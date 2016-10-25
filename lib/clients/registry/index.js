module.exports = DockerRegistry

const Promise = require('bluebird')
const request = require('request')
const err = require('./error.js')
const uris = require('./uri')

const defaultResolver = (res, body) => {
  var data = undefined
  try {
    data = JSON.parse(body)
  } catch(e) {
    console.log(e)
  } finally {
    console.log(res.statusCode+'> ', data)
  }
  return data
}

function HeaderFieldAndBody(key, field) {
  const headResolver = HeaderField(field)

  return (res, body) => {
    var data = defaultResolver(res, body)
    data[key] = headResolver(res, body)
    return data
  }
}

function HeaderField(field) {
  return (res, body) => {
    var data = res.headers[field]
    console.log(res.statusCode+'> ', data)
    return data
  }
}

function DockerRegistry(opts) {
  this.uri = null

  if(!opts || !(opts.host && opts.port))
    throw new Error('Expected options with host and port properties')

  this.uri = new uris.HttpUri(opts.host, opts.port, 'v2')
}

DockerRegistry.prototype.versionCheck = function() {
  return this.get('', { resolver: HeaderField('docker-distribution-api-version')})
};

DockerRegistry.prototype.catalog = function() {
  return this.get('_catalog/')
};

DockerRegistry.prototype.tags = function(name) {
  return this.get(`${name}/tags/list`)
    .then(tags => {
      if(tags.tags) {
        return tags.tags
      } else {
        throw new Error('No tags for image '+name)
      }
  })
};

DockerRegistry.prototype.get = function(path, opts) {
  return this.send(Object.assign(opts||{}, { path: path, method: 'GET'}))
}

DockerRegistry.prototype.manifestRef = function(name, tag) {
  return this.send({
    path: `${name}/manifests/${tag}`,
    method: 'GET',
    resolver: HeaderFieldAndBody('digest', 'docker-content-digest'),
    headers: {
      Accept: 'application/vnd.docker.distribution.manifest.v2+json'
    }
  })
};


// https://docs.docker.com/registry/spec/api/
DockerRegistry.prototype.manifests = function(name, ref) {
  return this.get(`${name}/manifests/${ref}`, { Host: this.uri.host })
};

DockerRegistry.prototype.delete = function(name, ref) {
  return this.send({
    path: `${name}/manifests/${ref}`,
    method: 'DELETE',
    responseCode: 202,
    resolver: () => null
  })
};

DockerRegistry.prototype.deleteBlob = function(name, ref) {
  return this.send({
    path: `${name}/blobs/${ref}`,
    method: 'DELETE',
    responseCode: 202,
    resolver: () => null
  })
}

DockerRegistry.prototype.send = function(opts) {
  opts = Object.assign(opts, {
    uri: this.uri.get(opts.path)
  })

  const resolver = opts.resolver || defaultResolver

  console.log('>', opts.method, opts.uri)
  return new Promise((resolve, reject) => {
    request(opts, (e, res, body) => {
      if(e) return reject(e)
      return res.statusCode == 200 || res.statusCode == opts.responseCode
        ? resolve(resolver(res, body))
        : reject(new err.ResponseError(res))
    })
  })
}