import { isArray, isString, isObject } from 'is-what'
import error from './errors'
import { AnyObject } from './declarations'

/**
 * gets an ID from a single piece of payload.
 *
 * @param {(object | ({ id: string } & object) | string)} payloadPiece
 * @param {object} [conf] (optional - for error handling) the vuex-easy-access config
 * @param {string} [path] (optional - for error handling) the path called
 * @param {(any[] | object | string)} [fullPayload] (optional - for error handling) the full payload on which each was `getId()` called
 * @returns {string} the id
 */
function getId (
  payloadPiece: object | ({ id: string } & object) | string,
  conf?: object,
  path?: string,
  fullPayload?: any[] | object | string
): string {
  if (isObject(payloadPiece)) {
    if ('id' in payloadPiece) return payloadPiece.id
    if (Object.keys(payloadPiece).length === 1) return Object.keys(payloadPiece)[0]
  }
  if (isString(payloadPiece)) return payloadPiece
  error('wildcardFormatWrong', conf, path)
  return ''
}

/**
 * Get all ids from an array payload.
 *
 * @param {any[]} payload
 * @param {object} [conf] (optional - for error handling) the vuex-easy-access config
 * @param {string} [path] (optional - for error handling) the path called
 * @returns {string[]} all ids
 */
export function getIdsFromPayload (payload: any[], conf?: object, path?: string): string[] {
  return payload.map(payloadPiece => getId(payloadPiece, conf, path, payload))
}

/**
 * Returns a value of a payload piece. Eg. {[id]: 'val'} will return 'val'
 *
 * @param {(object | string)} payloadPiece
 * @returns {any}
 */
export function getValueFromPayloadPiece (payloadPiece: object | string): any {
  if (
    isObject(payloadPiece) &&
    !('id' in payloadPiece) &&
    Object.keys(payloadPiece).length === 1
  ) {
    return Object.values(payloadPiece)[0]
  }
  return payloadPiece
}

/**
 * Checks the ratio between an array of IDs and a path with wildcards
 *
 * @param {string[]} ids
 * @param {string} path
 * @param {object} [conf] (optional - for error handling) the vuex-easy-access config
 * @returns {boolean} true if no problem. false if the ratio is incorrect
 */
export function checkIdWildcardRatio (ids: string[], path: string, conf: object): boolean {
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
 * @param {string[]} ids
 * @param {string} path 'path.*.with.*.wildcards'
 * @param {object} [state] RELATIVE TO PATH START! the state to check if the value actually exists
 * @param {object} [conf] (optional - for error handling) the vuex-easy-access config
 * @returns {string} The path with '*' replaced by IDs
 */
export function fillinPathWildcards (
  ids: string[],
  path: string,
  state?: object,
  conf?: object
): string {
  // Ignore pool check if '*' comes last
  const ignorePoolCheckOn = (path.endsWith('*')) ? ids[ids.length - 1] : null
  ids.forEach((_id, _index, _array) => {
    const idIndex = path.indexOf('*')
    const pathUntilPool = path.substring(0, idIndex)
    // check for errors when both state and conf are passed
    // pathUntilPool can be '' in case the path starts with '*'
    if (ignorePoolCheckOn !== _id && state && conf) {
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
 * ('sub', payload) becomes →  {sub: payload}
 *
 * @param   {string} path     'a/path/like.this'
 * @param   {*}      payload
 * @param   {object} [state] the state to check if the value actually exists
 * @param   {object} [conf] (optional - for error handling) the vuex-easy-access config
 * @returns {AnyObject} a nested object re-created based on the path & payload
 */
export function createObjectFromPath (
  path: string,
  payload: any,
  state?: object,
  conf?: object
): AnyObject {
  // edge cases
  if (path === '*') return payload
  if (!path.includes('.') && !path.includes('/')) return {[path]: payload}
  // start
  let newValue = payload
  if (path.includes('*')) {
    // only work with arrays
    if (!isArray(payload)) payload = [payload]
    const lastPayloadPiece = payload.pop()
    let ids = payload
    // CASE: 'dex/pokemonById.*.tags'
    if (!path.endsWith('*')) {
      newValue = lastPayloadPiece
    }
    // CASE: 'dex/pokemonById.*.tags.*'
    if (path.endsWith('*')) {
      const lastId = getId(lastPayloadPiece, conf, path)
      ids.push(lastId)
      newValue = getValueFromPayloadPiece(lastPayloadPiece)
      if (isObject(newValue)) newValue.id = lastId
    }
    ids = ids.map(_id => {
      _id = _id.replace('.', '_____dot_____')
      _id = _id.replace('/', '_____slash_____')
      return _id
    })
    if (!checkIdWildcardRatio(ids, path, conf)) return
    const pathWithIds = fillinPathWildcards(ids, path, state, conf)
    path = pathWithIds
  }
  // important to set the result here and not return the reduce directly!
  const result = {}
  path.match(/[^\/^\.]+/g)
    .reduce((carry, _prop, index, array) => {
      _prop = _prop.replace('_____dot_____', '.')
      _prop = _prop.replace('_____slash_____', '/')
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
 * @returns {string[]} with keys
 */
export function getKeysFromPath (path: string): string[] {
  if (!path) return []
  return path.match(/[^\/^\.]+/g)
}

/**
 * Gets a deep property in an object, based on a path to that property
 *
 * @param {object} target an object to wherefrom to retrieve the deep reference of
 * @param {string} path   'path/to.prop'
 * @returns {AnyObject} the last prop in the path
 */
export function getDeepRef (target: object = {}, path: string): AnyObject {
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
 * @returns {AnyObject}          the property's value
 */
export function getDeepValue (target: object, path: string): AnyObject {
  return getDeepRef(target, path)
}

/**
 * Sets a value to a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to set the value on
 * @param   {string} path     'path/to/prop.subprop'
 * @param   {*}      value    the value to set
 * @returns {AnyObject} the original target object
 */
export function setDeepValue (target: object, path: string, value: any): AnyObject {
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
 * @returns {number}          the new length of the array
 */
export function pushDeepValue (target: object, path: string, value: any): number {
  const deepRef = getDeepRef(target, path)
  if (!isArray(deepRef)) return
  return deepRef.push(value)
}

/**
 * Pops a value of an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to pop the value of
 * @param   {string} path     'path.to.sub.prop'
 * @returns {*}               the popped value
 */
export function popDeepValue (target: object, path: string): any {
  const deepRef = getDeepRef(target, path)
  if (!isArray(deepRef)) return
  return deepRef.pop()
}

/**
 * Shift a value of an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to shift the value of
 * @param   {string} path     'path.to.sub.prop'
 * @returns {*}               the shifted value
 */
export function shiftDeepValue (target: object, path: string): any {
  const deepRef = getDeepRef(target, path)
  if (!isArray(deepRef)) return
  return deepRef.shift()
}

/**
 * Splice into an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target       the Object to splice the value of
 * @param   {string} path         'path/to.sub.prop'
 * @param   {number} [index=0]        the index to splice in the value, defaults to 0
 * @param   {number} [deleteCount=0]  the amount of items to delete, defaults to 0
 * @param   {*}      value        the value to splice in
 * @returns {any[]}              an array containing the deleted elements
 */
export function spliceDeepValue (
  target: object,
  path: string,
  index: number = 0,
  deleteCount: number = 0,
  value: any
): any[] {
  const deepRef = getDeepRef(target, path)
  if (!isArray(deepRef)) return
  if (value === undefined) return deepRef.splice(index, deleteCount)
  return deepRef.splice(index, deleteCount, value)
}
