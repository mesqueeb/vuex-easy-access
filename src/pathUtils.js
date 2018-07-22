import { isArray, isString, isObject } from 'is-what'
import error from './errors'

/**
 * gets an ID from a single piece of payload.
 *
 * @param {object, string} payload
 * @param {object} conf (optional - for error handling) the vuex-easy-access config
 * @param {string} path (optional - for error handling) the path called
 * @param {array|object|string} fullPayload (optional - for error handling) the full payload on which each was `getId()` called
 * @returns {string} the id
 */
function getId (payloadPiece, conf, path, fullPayload) {
  if (isObject(payloadPiece)) {
    if (payloadPiece.id) return payloadPiece.id
    if (Object.keys(payloadPiece).length === 1) return Object.keys(payloadPiece)[0]
  }
  if (isString(payloadPiece)) return payloadPiece
  error('wildcardFormatWrong', conf, path, payloadPiece)
  return false
}

/**
 * Get all ids from an array payload.
 *
 * @param {array[string]} payload
 * @param {object} conf (optional - for error handling) the vuex-easy-access config
 * @param {string} path (optional - for error handling) the path called
 * @returns {array[string]} all ids
 */
export function getIdsFromPayload (payload, conf, path) {
  return payload.map(payloadPiece => getId(payloadPiece, conf, path, payload))
}

/**
 * Returns a value of a payload piece. Eg. {[id]: 'val'} will return 'val'
 *
 * @param {*} payloadPiece
 * @returns {*} the value
 */
export function getValueFromPayloadPiece (payloadPiece) {
  if (
    isObject(payloadPiece) &&
    !payloadPiece.id &&
    Object.keys(payloadPiece).length === 1
  ) {
    return Object.values(payloadPiece)[0]
  }
  return payloadPiece
}

/**
 * Checks the ratio between an array of IDs and a path with wildcards
 *
 * @param {array} ids
 * @param {string} path
 * @param {object} conf (optional - for error handling) the vuex-easy-access config
 * @returns {Bool} true if no problem. false if the ratio is incorrect
 */
export function checkIdWildcardRatio (ids, path, conf) {
  const match = path.match(/\*/g)
  const idCount = (isArray(match))
    ? match.length
    : 0
  if (ids.length === idCount) return true
  error('mutationSetterPropPathWildcardIdCount', conf)
  return false
}

/**
 * Fill in IDs at '*' in a path, based on the IDs received.
 *
 * @param {array} ids
 * @param {string} path 'path.*.with.*.wildcards'
 * @param {object} state RELATIVE TO PATH START! the state to check if the value actually exists
 * @param {object} conf (optional - for error handling) the vuex-easy-access config
 * @returns {string} The path with '*' replaced by IDs
 */
export function fillinPathWildcards (ids, path, state, conf) {
  ids.forEach((_id, _index, _array) => {
    const idIndex = path.indexOf('*')
    const pathUntilPool = path.substring(0, idIndex)
    // check for errors when both state and conf are passed
    // pathUntilPool can be '' in case the path starts with '*'
    if (state && conf) {
      const pool = (pathUntilPool)
        ? getDeepRef(state, pathUntilPool)
        : state
      if (pool[_id] === undefined) return error('mutationSetterPropPathWildcardMissingItemDoesntExist', conf, pathUntilPool, _id)
    }
    path = path
      .split('')
      .map((char, ind) => ind === idIndex ? _id : char)
      .join('')
  })
  return path
}

/**
 * ('/sub.prop', payload) becomes →  {sub: {prop: payload}}
 *
 * @param   {string} path     'a/path/like.this'
 * @param   {*}      payload
 * @param   {object} state the state to check if the value actually exists
 * @param   {object} conf (optional - for error handling) the vuex-easy-access config
 * @returns {object} a nested object re-created based on the path & payload
 */
export function createObjectFromPath (path, payload, state, conf) {
  let newValue = payload
  if (path.includes('*')) {
    const idsPayload = (!isArray(payload))
      ? [payload]
      : payload
    const ids = getIdsFromPayload(idsPayload, conf, path)
    // CASE: 'dex/pokemonById.*.tags.*'
    if (path.endsWith('*')) {
      const lastId = ids[ids.length - 1]
      newValue = getValueFromPayloadPiece(idsPayload[idsPayload.length - 1])
      if (isObject(newValue)) newValue.id = lastId
    }
    // CASE: 'dex/pokemonById.*.tags'
    if (!path.endsWith('*')) {
      ids.pop()
      newValue = idsPayload.pop()
    }
    if (!checkIdWildcardRatio(ids, path, conf)) return
    const pathWithIds = fillinPathWildcards(ids, path, state, conf)
    path = pathWithIds
  }
  // important to set the result here and not return the reduce directly!
  const result = {}
  path.match(/[^\/^\.]+/g)
    .reduce((carry, _prop, index, array) => {
      const container = (index === array.length - 1)
        ? newValue
        : {}
      carry[_prop] = container
      return container
    }, result)
  return result
}

/**
 * Returns the keys of a path
 *
 * @param   {string} path   a/path/like.this
 * @returns {array} with keys
 */
export function getKeysFromPath (path) {
  if (!path) return []
  return path.match(/[^\/^\.]+/g)
}

/**
 * Gets a deep property in an object, based on a path to that property
 *
 * @param {object} target an object to wherefrom to retrieve the deep reference of
 * @param {string} path   'path/to.prop'
 *
 * @returns {object} the last prop in the path
 */
export function getDeepRef (target = {}, path) {
  const keys = getKeysFromPath(path)
  if (!keys.length) return target
  let obj = target
  while (obj && keys.length > 1) {
    obj = obj[keys.shift()]
  }
  const key = keys.shift()
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
export function getDeepValue (target, path) {
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
export function setDeepValue (target, path, value) {
  const keys = getKeysFromPath(path)
  const lastKey = keys.pop()
  const deepRef = getDeepRef(target, keys.join('.'))
  if (deepRef && deepRef.hasOwnProperty(lastKey)) {
    deepRef[lastKey] = value
  }
  return target
}

/**
 * Pushes a value in an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to push the value on
 * @param   {string} path     'path/to.sub.prop'
 * @param   {*}      value    the value to push
 *
 * @returns {number}          the new length of the array
 */
export function pushDeepValue (target, path, value) {
  const deepRef = getDeepRef(target, path)
  if (!isArray(deepRef)) return
  return deepRef.push(value)
}

/**
 * Pops a value of an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to pop the value of
 * @param   {string} path     'path.to.sub.prop'
 *
 * @returns {*}               the popped value
 */
export function popDeepValue (target, path) {
  const deepRef = getDeepRef(target, path)
  if (!isArray(deepRef)) return
  return deepRef.pop()
}

/**
 * Shift a value of an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to shift the value of
 * @param   {string} path     'path.to.sub.prop'
 *
 * @returns {*}               the shifted value
 */
export function shiftDeepValue (target, path) {
  const deepRef = getDeepRef(target, path)
  if (!isArray(deepRef)) return
  return deepRef.shift()
}

/**
 * Splice into an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target       the Object to splice the value of
 * @param   {string} path         'path/to.sub.prop'
 * @param   {*}      value        the value to splice in
 * @param   {number} index        the index to splice in the value, defaults to 0
 * @param   {number} deleteCount  the amount of items to delete, defaults to 0
 *
 * @returns {array}              an array containing the deleted elements
 */
export function spliceDeepValue (target, path, index = 0, deleteCount = 0, value) {
  const deepRef = getDeepRef(target, path)
  if (!isArray(deepRef)) return
  return deepRef.splice(index, deleteCount, value)
}
