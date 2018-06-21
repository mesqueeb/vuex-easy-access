import { isArray } from 'is-what'

/**
 * Returns the keys of a path
 *
 * @param   {string} path   a/path/like.this
 * @returns {array} with keys
 */
function getKeysFromPath (path) {
  if (!path) return []
  return path.match(/\w+/g)
}

/**
 * Gets a deep property in an object, based on a path to that property
 *
 * @param {object} target an object to wherefrom to retrieve the deep reference of
 * @param {string} path   'path/to.prop'
 *
 * @returns {object} the property which was requested
 */
function getDeepRef (target = {}, path) {
  let keys = getKeysFromPath(path)
  if (!keys.length) return target
  let obj = target
  while (obj && keys.length > 1) {
    obj = obj[keys.shift()]
  }
  let key = keys.shift()
  if (obj && obj.hasOwnProperty(key)) {
    return obj[key]
  }
}

/**
 * Gets a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to get the value of
 * @param   {string} path     'path/to/prop.subprop'
 *
 * @returns {object}          the property's value
 */
function getDeepValue (target, path) {
  return getDeepRef(target, path)
}

/**
 * Sets a value to a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to set the value on
 * @param   {string} path     'path/to/prop.subprop'
 * @param   {*}      value    the value to set
 *
 * @returns {object}          the original target object
 */
function setDeepValue (target, path, value) {
  const keys = getKeysFromPath(path)
  const lastKey = keys.pop()
  const deepRef = getDeepRef(target, keys.join())
  if (deepRef && deepRef.hasOwnProperty(lastKey)) {
    deepRef[lastKey] = value
  }
  return target
}

/**
 * Pops a value of an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to set the value on
 * @param   {string} path     'path.to.sub.prop'
 *
 * @returns {*}               the popped value
 */
function popDeepValue (target, path) {
  const deepRef = getDeepRef(target, path)
  if (!isArray(deepRef)) return
  return deepRef.pop()
}
/**
 * Pushes a value in an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to set the value on
 * @param   {string} path     'path/to.sub.prop'
 * @param   {*}      value    the value to set
 *
 * @returns {number}          the new length of the array
 */
function pushDeepValue (target, path, value) {
  const deepRef = getDeepRef(target, path)
  if (!isArray(deepRef)) return
  return deepRef.push(value)
}
/**
 * Splice into an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target       the Object to set the value on
 * @param   {string} path         'path/to.sub.prop'
 * @param   {*}      value        the value to splice in
 * @param   {number} index        the index to splice in the value, defaults to 0
 * @param   {number} deleteCount  the amount of items to delete, defaults to 0
 *
 * @returns {array}              an array containing the deleted elements
 */
function spliceDeepValue (target, path, index = 0, deleteCount = 0, value) {
  const deepRef = getDeepRef(target, path)
  if (!isArray(deepRef)) return
  return deepRef.splice(index, deleteCount, value)
}

export { getDeepRef, getKeysFromPath, setDeepValue, getDeepValue, popDeepValue, pushDeepValue, spliceDeepValue }
