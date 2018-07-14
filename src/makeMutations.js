import { setDeepValue, pushDeepValue, popDeepValue, shiftDeepValue, spliceDeepValue } from './objectDeepValueUtils'
import { isObject, isArray } from 'is-what'
import defaultConf from './defaultConfig'

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
      // All good, make the action!
      mutations[name] = (state, newVal) => {
        return setDeepValue(state, propPath, newVal)
      }
      // BTW, check if the value of this prop was an object, if so, let's do it's children as well!
      const propValue = propParent[prop]
      if (isObject(propValue)) {
        const childrenMutations = makeMutationsForAllProps(propValue, propPath, conf)
        mutations = {...mutations, ...childrenMutations}
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
