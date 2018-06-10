/**
 * Sets the payload to a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to set the value on
 * @param   {string} path     'path.to.sub.prop'
 * @param   {*}      payload  the value to set
 *
 * @returns {object}          the original target object
 */
function setDeepValue (target, path, payload) {
  let keys = path.split('.')
  let obj = target
  while (obj && keys.length > 1) {
    obj = obj[keys.shift()]
  }
  let key = keys.shift()
  if (obj && obj.hasOwnProperty(key)) {
    obj[key] = payload
  }
  return target
}

/**
 * Gets a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to get the value of
 * @param   {string} path     'model/path/path.to.sub.prop'
 *
 * @returns {object}          the property's value
 */
function getDeepValue (target, path) {
  let keys = path.match(/\w+/g)
  let obj = target
  while (obj && keys.length > 1) {
    obj = obj[keys.shift()]
  }
  let key = keys.shift()
  if (obj && obj.hasOwnProperty(key)) {
    return obj[key]
  }
}

export { setDeepValue, getDeepValue }