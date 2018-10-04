import { getValueFromPayloadPiece, checkIdWildcardRatio, getIdsFromPayload, fillinPathWildcards, setDeepValue, getDeepRef, pushDeepValue, popDeepValue, shiftDeepValue, spliceDeepValue } from './pathUtils'
import { isObject, isArray } from 'is-what'
import error from './errors'
import Vue from 'vue'
import merge from 'merge-anything'
import defaultConf from './defaultConfig'
import { IDefaultConfig, AnyObject } from './declarations'

interface IInfoNS {
  moduleNamespace: string
}

// define possible functions
// eslint-disable-next-line
function SET_PROP_SUBPROP (
  state: AnyObject,
  payload: any,
  PROP_SUBPROP: string
): AnyObject {
  return setDeepValue(state, PROP_SUBPROP, payload)
}

// eslint-disable-next-line
function DELETE_PROP_SUBPROP (
  state: AnyObject,
  PROP_SUBPROP: string
) {
  const propsArray = (PROP_SUBPROP.includes('.'))
    ? PROP_SUBPROP.split('.')
    : [PROP_SUBPROP]
  const lastProp = propsArray.pop()
  const propsWithoutLast = propsArray.join('.')
  const ref = getDeepRef(state, propsWithoutLast)
  return Vue.delete(ref, lastProp)
}

// eslint-disable-next-line
function MUTATE_PROP_x_SUBPROP (
  state: AnyObject,
  payload: any,
  PROP_SUBPROP: string,
  conf: IDefaultConfig
): AnyObject {
  if (!isArray(payload)) payload = [payload]
  const newValue = payload.pop()
  const ids = getIdsFromPayload(payload, conf, PROP_SUBPROP)
  if (!checkIdWildcardRatio(ids, PROP_SUBPROP, conf)) return
  const pathWithIds = fillinPathWildcards(ids, PROP_SUBPROP, state, conf)
  return setDeepValue(state, pathWithIds, newValue)
}

// eslint-disable-next-line
function DELETE_PROP_x_SUBPROP (
  state: AnyObject,
  payload: any,
  PROP_SUBPROP: string,
  conf: IDefaultConfig
) {
  const propsArray = (PROP_SUBPROP.includes('.'))
    ? PROP_SUBPROP.split('.')
    : [PROP_SUBPROP]
  const lastProp = propsArray.pop()
  const propsWithoutLast = propsArray.join('.')
  const ids = payload
  if (!checkIdWildcardRatio(ids, propsWithoutLast, conf)) return
  const pathWithIds = fillinPathWildcards(ids, propsWithoutLast, state, conf)
  const ref = getDeepRef(state, pathWithIds)
  return Vue.delete(ref, lastProp)
}

// eslint-disable-next-line
function MUTATE_PROP_x (
  state: AnyObject,
  payload: any,
  PROP_SUBPROP: string,
  conf: IDefaultConfig,
  propValue: any
) {
  if (!isArray(payload)) payload = [payload]
  const ids = getIdsFromPayload(payload, conf, PROP_SUBPROP)
  if (!checkIdWildcardRatio(ids, PROP_SUBPROP, conf)) return
  const lastId = ids.pop()
  const propPathWithoutLast = PROP_SUBPROP.slice(0, -1)
  const pathWithIds = fillinPathWildcards(ids, propPathWithoutLast, state, conf)
  const ref = getDeepRef(state, pathWithIds)
  let newValue = getValueFromPayloadPiece(payload.pop())
  if (isObject(newValue)) newValue.id = lastId
  if (isObject(propValue)) newValue = merge(propValue, newValue)
  return Vue.set(ref, lastId, newValue)
}

// eslint-disable-next-line
function DELETE_PROP_x (
  state: AnyObject,
  id: string,
  PROP_SUBPROP: string,
  conf: IDefaultConfig
) {
  if (!id) return error('mutationDeleteNoId', conf, PROP_SUBPROP)
  const ids = (!isArray(id)) ? [id] : id
  if (!checkIdWildcardRatio(ids, PROP_SUBPROP, conf)) return
  const lastId = ids.pop()
  const pathWithoutWildcard = (PROP_SUBPROP.endsWith('*'))
    ? PROP_SUBPROP.slice(0, -1)
    : PROP_SUBPROP
  const pathWithIds = fillinPathWildcards(ids, pathWithoutWildcard, state, conf)
  const ref = getDeepRef(state, pathWithIds)
  return Vue.delete(ref, lastId)
}

// execute mutation
function executeArrayMutation (
  state: AnyObject,
  payload: any,
  action: string,
  PROP_SUBPROP: string,
  conf: IDefaultConfig
) {
  let newValue, pathWithIds
  if (!PROP_SUBPROP.includes('*')) {
    newValue = payload
    pathWithIds = PROP_SUBPROP
  } else {
    if (!isArray(payload) && action !== 'splice') payload = [payload]
    if (action !== 'pop' && action !== 'shift') newValue = payload.pop()
    const ids = getIdsFromPayload(payload, conf, PROP_SUBPROP)
    if (!checkIdWildcardRatio(ids, PROP_SUBPROP, conf)) return
    pathWithIds = fillinPathWildcards(ids, PROP_SUBPROP, state, conf)
  }
  if (action === 'push') {
    return pushDeepValue(state, pathWithIds, newValue)
  }
  if (action === 'pop') {
    return popDeepValue(state, pathWithIds)
  }
  if (action === 'shift') {
    return shiftDeepValue(state, pathWithIds)
  }
  if (action === 'splice') {
    const index = newValue[0]
    const deleteCount = newValue[1]
    const value = newValue[2]
    return spliceDeepValue(state, pathWithIds, index, deleteCount, value)
  }
}

/**
 * Creates the mutations for each property of the object passed recursively
 *
 * @param   {object} propParent an Object of which all props will get a mutation
 * @param   {(string | null)} path the path taken until the current propParent instance
 * @param   {IDefaultConfig} conf user config
 * @param   {string} [infoNS] (optional) module namespace in light of ignoreProps config
 *
 * @returns {AnyObject} all mutations for each property.
 */
function makeMutationsForAllProps (
  propParent: object,
  path: string | null,
  conf: IDefaultConfig,
  infoNS?: IInfoNS,
): AnyObject {
  if (!isObject(propParent)) return {}
  return Object.keys(propParent)
    .reduce((mutations, prop) => {
      // Get the path info up until this point
      const PROP_SUBPROP = (!path)
        ? prop
        : path + '.' + prop
      // Avoid making setters for private props
      if (conf.ignorePrivateProps && prop[0] === '_') return mutations
      if (conf.ignoreProps.some(ignPropFull => {
        const separatePropFromNS = /(.*?)\/([^\/]*?)$/.exec(ignPropFull)
        const ignPropNS = (separatePropFromNS) ? separatePropFromNS[1] + '/' : ''
        const ignProp = (separatePropFromNS) ? separatePropFromNS[2] : ignPropFull
        return (
          (!infoNS && ignProp === PROP_SUBPROP) ||
          (infoNS && infoNS.moduleNamespace === ignPropNS && ignProp === PROP_SUBPROP)
        )
      })) {
        return mutations
      }
      // Get the value of the prop
      const propValue = propParent[prop]

      // =================================================>
      //   SET & DELETE MUTATION NAMES
      // =================================================>
      const SET = (conf.pattern === 'traditional')
        ? 'SET_' + PROP_SUBPROP.toUpperCase()
        : PROP_SUBPROP
      const DELETE = (conf.pattern === 'traditional')
        ? 'DELETE_' + PROP_SUBPROP.toUpperCase()
        : '-' + PROP_SUBPROP
      // =================================================>
      //   PROP MUTATION
      // =================================================>
      // All good, make the mutation!
      if (!PROP_SUBPROP.includes('*')) {
        mutations[SET] = (state, payload) => SET_PROP_SUBPROP(state, payload, PROP_SUBPROP)
        mutations[DELETE] = (state) => DELETE_PROP_SUBPROP(state, PROP_SUBPROP)
      } else if (prop !== '*') {
        // path includes wildcard, but prop is not a wildcard
        mutations[SET] = (state, payload) => MUTATE_PROP_x_SUBPROP(state, payload, PROP_SUBPROP, conf)
        mutations[DELETE] = (state, payload) => DELETE_PROP_x_SUBPROP(state, payload, PROP_SUBPROP, conf)
      }
      // =================================================>
      //   WILDCARD MUTATION
      // =================================================>
      if (prop === '*') {
        mutations[SET] = (state, payload) => MUTATE_PROP_x(state, payload, PROP_SUBPROP, conf, propValue)
        mutations[DELETE] = (state, payload) => DELETE_PROP_x(state, payload, PROP_SUBPROP, conf)
      }
      // =================================================>
      //   ARRAY MUTATIONS
      // =================================================>

      if (isArray(propValue)) {
        // PUSH mutation name
        const push = (conf.pattern === 'traditional')
          ? 'PUSH_' + PROP_SUBPROP.toUpperCase()
          : PROP_SUBPROP + '.push'
        mutations[push] = (state, payload) => {
          return executeArrayMutation(state, payload, 'push', PROP_SUBPROP, conf)
        }
        // POP mutation name
        const pop = (conf.pattern === 'traditional')
          ? 'POP_' + PROP_SUBPROP.toUpperCase()
          : PROP_SUBPROP + '.pop'
        mutations[pop] = (state, payload) => {
          return executeArrayMutation(state, payload, 'pop', PROP_SUBPROP, conf)
        }
        // SHIFT mutation name
        const shift = (conf.pattern === 'traditional')
          ? 'SHIFT_' + PROP_SUBPROP.toUpperCase()
          : PROP_SUBPROP + '.shift'
        mutations[shift] = (state, payload) => {
          return executeArrayMutation(state, payload, 'shift', PROP_SUBPROP, conf)
        }
        // SPLICE mutation name
        const splice = (conf.pattern === 'traditional')
          ? 'SPLICE_' + PROP_SUBPROP.toUpperCase()
          : PROP_SUBPROP + '.splice'
        mutations[splice] = (state, payload) => {
          return executeArrayMutation(state, payload, 'splice', PROP_SUBPROP, conf)
        }
      }
      // =================================================>
      //   CHILDREN MUTATIONS
      // =================================================>
      if (isObject(propValue) && Object.keys(propValue).length) {
        const childrenMutations = makeMutationsForAllProps(propValue, PROP_SUBPROP, conf, infoNS)
        Object.assign(mutations, childrenMutations)
      }
      return mutations
    }, {})
}

/**
 * Creates all mutations for the state of a module.
 * Usage:
 * commit('module/path/SET_PATH.TO.PROP', newValue)
 * Import method:
 * mutations {
 *   ...defaultMutations(initialState)
 * }
 *
 * @param {object} initialState the initial state of a module
 * @param {IDefaultConfig} [userConf={}] (optional) user config
 * @param {IInfoNS} [infoNS] (optional) info on the module namespace
 * @returns {AnyObject} all mutations for the state
 */
export function defaultMutations (
  initialState: object,
  userConf: IDefaultConfig = {},
  infoNS?: IInfoNS
): AnyObject {
  const mergedConf: IDefaultConfig = Object.assign({}, defaultConf, userConf)
  return makeMutationsForAllProps(initialState, null, mergedConf, infoNS)
}
