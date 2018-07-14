import { setDeepValue, getDeepRef, pushDeepValue, popDeepValue, shiftDeepValue, spliceDeepValue } from './objectDeepValueUtils'
import { isObject, isArray } from 'is-what'
import defaultConf from './defaultConfig'
import error from './errors'
import Vue from 'vue'
/**
 * Creates the mutations for each property of the object passed recursively
 *
 * @param   {object} propParent an Object of which all props will get a mutation
 * @param   {string} path       the path taken until the current propParent instance
 * @param   {object} conf       user config
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
      // mutation name
      const name = (conf.pattern === 'traditional')
        ? 'SET_' + propPath.toUpperCase()
        : propPath
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
      // All good, make the mutation!
      mutations[name] = (state, newVal) => {
        return setDeepValue(state, propPath, newVal)
      }
      // Get the value of the prop
      const propValue = propParent[prop]
      // let's do it's children as well!
      if (isObject(propValue) && Object.keys(propValue).length) {
        const childrenMutations = makeMutationsForAllProps(propValue, propPath, conf)
        Object.assign(mutations, childrenMutations)
      }
      // let's create a wildcard & deletion mutations
      if (isObject(propValue) && !Object.keys(propValue).length) {
        // wildcard
        mutations[name + '.*'] = (state, newVal) => {
          if (!newVal.id) return error('mutationSetterWildcard')
          const ref = getDeepRef(state, propPath)
          Vue.set(ref, newVal.id, newVal)
        }
        // deletion
        const deleteName = (conf.pattern === 'traditional')
          ? 'DELETE_' + propPath.toUpperCase()
          : '-' + propPath
        mutations[deleteName] = (state, id) => {
          if (id) {
            const ref = getDeepRef(state, propPath)
            return Vue.delete(ref, id)
          }
          const propArr = propPath.split('.')
          id = propArr.pop()
          if (!propArr.length) {
            return Vue.delete(state, id)
          }
          const ref = getDeepRef(state, propArr.join('.'))
          return Vue.delete(ref, id)
        }
        mutations[deleteName + '.*'] = (state, {id}) => {
          if (!id) return error('mutationDeleteWildcard')
          const ref = getDeepRef(state, propPath)
          return Vue.delete(ref, id)
        }
      }
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
        mutations[shift] = (state, value) => {
          return shiftDeepValue(state, propPath, value)
        }
        // SPLICE mutation name
        const splice = (conf.pattern === 'traditional')
          ? 'SPLICE_' + propPath.toUpperCase()
          : propPath + '.splice'
        mutations[splice] = (state, array) => {
          return spliceDeepValue(state, propPath, ...array)
        }
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
