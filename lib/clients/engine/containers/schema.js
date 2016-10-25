const Schema = require('../../../schemas').Schema;
const Type = Schema.Types.Type;

const ContainerNameType = new Type('ContainerName', /^\/?[a-zA-Z0-9_-]+$/, null, true)

module.exports.list = {
  qs: new Schema('containers.list.qs', {
    all : Schema.Types.Truthy,
    limit : Schema.Types.Integer,
    since: Schema.Types.Digest,
    before: Schema.Types.Digest,
    size: Schema.Types.Truthy,
    filters: Schema.Types.Any // this is frustrating, this SHOULD be information in the request BODY
  })
}

module.exports.remove = {
  qs : new Schema('containers.remove.qs', {
    v: Schema.Types.Truthy,
    force: Schema.Types.Truthy
  })
}

module.exports.create = {
  qs: new Schema('containers.create.qs', {
    name: ContainerNameType 
  }),
  //body: new Schema('containers/create/body')
}
    /*create_container_name : {
      name: containerNameMatch
    },
    create_container_body : {
      Image: imageNameMatch
    }*/

module.exports.start = {
  qs: new Schema('containers.start.qs', {
    detachKeys: new Type('containers.start.qs.detachKeys', /(^ctrl-[a-z@^[,_])|[a-zA-Z]/)
  })
}

module.exports.inspect = {
  qs: new Schema('containers.inspect.qs', {
    size: Schema.Types.Truthy
  })
}

module.exports.stop = {
  qs: new Schema('containers.stop.qs', {
    t: Schema.Types.Integer
  })
}

module.exports.top = {
  qs: new Schema('containers.top.qs', {
    ps_args: new Type('ps-args', /^[-]*[a-zA-Z]+\s?[+-a-zA-Z0-9]*$/g)
  })
}

module.exports.stats = {
  qs: new Schema('containers.stats.qs', {
    stream: Schema.Types.Truthy
  })
}

Object.freeze(module.exports)