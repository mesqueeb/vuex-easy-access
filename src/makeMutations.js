import { setDeepValue, getDeepRef, pushDeepValue, popDeepValue, shiftDeepValue, spliceDeepValue } from './objectDeepValueUtils'
import { isObject, isArray } from 'is-what'
import defaultConf from './defaultConfig'
import error from './errors'
import Vue from 'vue'
import merge from 'nanomerge'

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
function makeMutationsForAllProps(
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
      const propPath = (!path)
        ? prop
        : path + '.' + prop
      // Avoid making setters for private props
      if (conf.ignorePrivateProps && prop[0] === '_') return mutations
      if (conf.ignoreProps.some(ignPropFull => {
        const separatePropFromNS = /(.*?)\/([^\/]*?)$/.exec(ignPropFull)
        const ignPropNS = (separatePropFromNS) ? separatePropFromNS[1] + '/' : ''
        const ignProp = (separatePropFromNS) ? separatePropFromNS[2] : ignPropFull
        return (
          !infoNS && ignProp === propPath ||
          infoNS && infoNS.moduleNamespace == ignPropNS && ignProp === propPath
        )
      })) {
        return mutations
      }
      // Get the value of the prop
      const propValue = propParent[prop]
      let wildcardDefaultValues
      // define possible functions
      function setProp (state, newVal) {
        return setDeepValue(state, propPath, newVal)
      }
      function setWildcardProp (state, newVal) {
        const id = newVal.id
        if (!id) return error('mutationSetterNoId', conf)
        const ref = getDeepRef(state, propPath)
        if (isObject(propValue)) newVal = merge(propValue, newVal)
        return Vue.set(ref, id, newVal)
      }
      function setPropWithWildcardPath (state, payload) {
        if (!payload.val) return error('mutationSetterPropPathWildcardMissingVal', conf)
        const id = payload.id
        if (!id) return error('mutationSetterPropPathWildcardMissingId', conf)
        const pathUntilPool = propPath.substr(0, propPath.indexOf('*'))
        const pool = getDeepRef(state, pathUntilPool)
        console.log('pool → ', pool)
        console.log('pool[id] → ', pool[id])
        console.log('pool[id].gym → ', pool[id].gym)
        if (!pool[id]) return error('mutationSetterPropPathWildcardMissingItemDoesntExist', conf)
        console.log('propPath.replace(\'*\', id) → ', propPath.replace('*', id))
        setDeepValue(state, propPath.replace('*', id), payload.val)
        console.log('pool[id].gym → ', pool[id].gym)
      }
      function deleteProp (state, val) {
        const id = val.id
        if (!id) return error('mutationDeleteNoId', conf)
        const ref = getDeepRef(state, propPath)
        return Vue.delete(ref, id)
      }
      // =================================================>
      //   NORMAL MUTATION
      // =================================================>
      // mutation name
      const name = (conf.pattern === 'traditional')
        ? 'SET_' + propPath.toUpperCase()
        : propPath
      // All good, make the mutation!
      if (!propPath.includes('*')) {
        mutations[name] = setProp
      } else if (prop !== '*') {
        // path includes wildcard, but prop is not a wildcard
        mutations[name] = setPropWithWildcardPath
      }
      // =================================================>
      //   WILDCARD MUTATIONS
      // =================================================>
      // let's create a wildcard & deletion mutations
      // deletion
      const deleteName = (conf.pattern === 'traditional')
      ? 'DELETE_' + propPath.toUpperCase()
      : '-' + propPath
      if (prop === '*') {
        mutations[name] = setWildcardProp
        mutations[deleteName] = deleteProp
      }
      if (isObject(propValue) && !Object.keys(propValue).length) {
        mutations[name + '.*'] = setWildcardProp
        mutations[deleteName + '.*'] = deleteProp
      }
      // =================================================>
      //   ARRAY MUTATIONS
      // =================================================>
      // If the prop is an array, make array mutations as well
      if (isArray(propValue)) {
        // PUSH mutation name
        const push = (conf.pattern === 'traditional')
          ? 'PUSH_' + propPath.toUpperCase()
          : propPath + '.push'
        mutations[push] = (state, value) => {
          return pushDeepValue(state, propPath, value)
        }
        // POP mutation name
        const pop = (conf.pattern === 'traditional')
          ? 'POP_' + propPath.toUpperCase()
          : propPath + '.pop'
        mutations[pop] = (state) => {
          return popDeepValue(state, propPath)
        }
        // SHIFT mutation name
        const shift = (conf.pattern === 'traditional')
          ? 'SHIFT_' + propPath.toUpperCase()
          : propPath + '.shift'
        mutations[shift] = (state) => {
          return shiftDeepValue(state, propPath)
        }
        // SPLICE mutation name
        const splice = (conf.pattern === 'traditional')
          ? 'SPLICE_' + propPath.toUpperCase()
          : propPath + '.splice'
        mutations[splice] = (state, array) => {
          return spliceDeepValue(state, propPath, ...array)
        }
      }
      // =================================================>
      //   CHILDREN MUTATIONS
      // =================================================>
      // let's do it's children as well!
      if (isObject(propValue) && Object.keys(propValue).length) {
        const childrenMutations = makeMutationsForAllProps(propValue, propPath, conf)
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
