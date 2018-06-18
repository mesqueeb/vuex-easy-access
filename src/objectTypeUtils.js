
function isObject (payload) {
  return Object.prototype.toString.call(payload) === '[object Object]'
}
function isArray (payload) {
  return Object.prototype.toString.call(payload) === '[object Array]'
}

export default { isObject, isArray }
