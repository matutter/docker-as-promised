/**
* Handlers are generators for handling docker registry/engine responses.
*/

module.exports.bi = bi
module.exports.json = json
module.exports.js = js // TODO: fix once docker #27418 is fixed. 
module.exports.text = text
module.exports.empty = empty
module.exports.header = header
module.exports.object = object

Object.seal(module.exports)

/**
* Produces a function that returns null
*/
function empty() {
  return null
}

/**
* Can test body === text or just return text without equivalence check
*/
function text(text) {
  if(text) {
    return (res, body) => {
      if(body.trim() === text)
        return text
      else 
        throw new Error(`Unexpected text in response body "${body}"`)
    }  
  } else {
    return (res, body) => body
  }
}

function object(res, object) {
  return object
}

/**
* parse body as JSON
* @return Function - (response, response_body)
* @throws Error - Is the JSON is malformed
*/
function json(res, body) {
  return JSON.parse(body)
}

/**
* Should not be used
*/
function js(res, body) {
  console.log(typeof body)
  console.log('!!! WARNING !!! Use of "eval"')
  var value = eval(body)
  return value
}

/**
* @param map - A object of the form { result_key : 'header-key' } where
* "header-key" is replaced with the header-content's value
* @return Function - (response, response_body)
* @throws Error - If one of the header fields is not found
*/
function header(map) {
  const keys = Object.keys(map)
  const len = keys.length
  
  if(!len) throw Error('Cannot map an empty object')

  return (res, body) => {
    var result = {}
    for(var i = 0; i < len; ++i) {
      var key = keys[i]
      var field = map[key]
      var val = res.headers[field]
      if(val) result[key] = val
        else throw new Error(`Header does not contain "${key}" field`)
    }
    return result
  }
}

/**
* Takes two handler methods as arguments and combines their output.
* The "B" handler output will override any "A" output because left assignment
* @param a - Function for handler A
* @param b - Function for handler B
* @return Function - (response, response_body)
*/
function bi(a, b) {
  return (res, body) => Object.assign(a(res, body), b(res, body))
}