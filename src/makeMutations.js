import { getValueFromPayloadPiece, checkIdWildcardRatio, getIdsFromPayload, fillinPathWildcards, setDeepValue, getDeepRef, pushDeepValue, popDeepValue, shiftDeepValue, spliceDeepValue } from './pathUtils'
import { isObject, isArray } from 'is-what'
import defaultConf from './defaultConfig'
import error from './errors'
import Vue from 'vue'
import merge from 'merge-anything'

/**
 * Creates the mutations for each property of the object passed recursively
 *
 * @param   {object} propParent an Object of which all props will get a mutation
 * @param   {string} path       the path taken until the current propParent instance
 * @param   {object} conf       user config
 * @param   {string} infoNS     (optional) module namespace in light of ignoreProps config
 *
 * @returns {object}            all mutations for each property.
 */
function makeMutationsForAllProps (
  propParent,
  path,
  conf = {},
  infoNS,
) {
  conf = Object.assign({}, defaultConf, conf)
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
      // define possible functions
      // eslint-disable-next-line
      function SET_PROP_SUBPROP (state, payload) {
        return setDeepValue(state, PROP_SUBPROP, payload)
      }
      // eslint-disable-next-line
      function DELETE_PROP_SUBPROP (state) {
        const propsArray = (PROP_SUBPROP.includes('.'))
          ? PROP_SUBPROP.split('.')
          : [PROP_SUBPROP]
        const lastProp = propsArray.pop()
        const propsWithoutLast = propsArray.join('.')
        const ref = getDeepRef(state, propsWithoutLast)
        return Vue.delete(ref, lastProp)
      }
      // eslint-disable-next-line
      function MUTATE_PROP_x_SUBPROP (state, payload) {
        if (!isArray(payload)) payload = [payload]
        const newValue = payload.pop()
        const ids = getIdsFromPayload(payload, conf, PROP_SUBPROP)
        if (!checkIdWildcardRatio(ids, PROP_SUBPROP, conf)) return
        const pathWithIds = fillinPathWildcards(ids, PROP_SUBPROP, state, conf)
        return setDeepValue(state, pathWithIds, newValue)
      }
      // eslint-disable-next-line
      function DELETE_PROP_x_SUBPROP (state, payload) {
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
      function MUTATE_PROP_x (state, payload) {
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
      function DELETE_PROP_x (state, id) {
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
        mutations[SET] = SET_PROP_SUBPROP
        mutations[DELETE] = DELETE_PROP_SUBPROP
      } else if (prop !== '*') {
        // path includes wildcard, but prop is not a wildcard
        mutations[SET] = MUTATE_PROP_x_SUBPROP
        mutations[DELETE] = DELETE_PROP_x_SUBPROP
      }
      // =================================================>
      //   WILDCARD MUTATION
      // =================================================>
      if (prop === '*') {
        mutations[SET] = MUTATE_PROP_x
        mutations[DELETE] = DELETE_PROP_x
      }
      // =================================================>
      //   ARRAY MUTATIONS
      // =================================================>
      // execute mutation
      function executeArrayMutation (state, payload, action) {
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
          return spliceDeepValue(state, pathWithIds, ...newValue)
        }
      }
      if (isArray(propValue)) {
        // PUSH mutation name
        const push = (conf.pattern === 'traditional')
          ? 'PUSH_' + PROP_SUBPROP.toUpperCase()
          : PROP_SUBPROP + '.push'
        mutations[push] = (state, payload) => {
          return executeArrayMutation(state, payload, 'push')
        }
        // POP mutation name
        const pop = (conf.pattern === 'traditional')
          ? 'POP_' + PROP_SUBPROP.toUpperCase()
          : PROP_SUBPROP + '.pop'
        mutations[pop] = (state, payload) => {
          return executeArrayMutation(state, payload, 'pop')
        }
        // SHIFT mutation name
        const shift = (conf.pattern === 'traditional')
          ? 'SHIFT_' + PROP_SUBPROP.toUpperCase()
          : PROP_SUBPROP + '.shift'
        mutations[shift] = (state, payload) => {
          return executeArrayMutation(state, payload, 'shift')
        }
        // SPLICE mutation name
        const splice = (conf.pattern === 'traditional')
          ? 'SPLICE_' + PROP_SUBPROP.toUpperCase()
          : PROP_SUBPROP + '.splice'
        mutations[splice] = (state, payload) => {
          return executeArrayMutation(state, payload, 'splice')
        }
      }
      // =================================================>
      //   CHILDREN MUTATIONS
      // =================================================>
      if (isObject(propValue) && Object.keys(propValue).length) {
        const childrenMutations = makeMutationsForAllProps(propValue, PROP_SUBPROP, conf)
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
 *   ...defaultMutations (initialState)
 * }
 *
 * @param   {object} initialState  the initial state of a module
 * @param   {object} conf          user config
 *
 * @returns {object}                all mutations for the state
 */
function defaultMutations (initialState, conf = {}, infoNS) {
  conf = Object.assign({}, defaultConf, conf)
  return makeMutationsForAllProps(initialState, null, conf, infoNS)
}

export { defaultMutations }
