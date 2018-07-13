import { setDeepValue, popDeepValue, pushDeepValue, spliceDeepValue } from './objectDeepValueUtils'
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
    let propPath = (!path)
      ? prop
      : path + '.' + prop
    // mutation name
    let name = (conf.pattern === 'simple')
      ? propPath
      : 'SET_' + propPath.toUpperCase()
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
    let propValue = propParent[prop]
    if (isObject(propValue)) {
      let childrenMutations = makeMutationsForAllProps(propValue, propPath, conf)
      mutations = {...mutations, ...childrenMutations}
    }
    // If the prop is an array, make array mutations as well
    if (isArray(propValue)) {
      // mutation name
      let pop = (conf.pattern === 'simple')
        ? propPath + '.pop'
        : 'POP_' + propPath.toUpperCase()
      mutations[pop] = (state) => {
        return popDeepValue(state, propPath)
      }
      // mutation name
      let push = (conf.pattern === 'simple')
        ? propPath + '.push'
        : 'PUSH_' + propPath.toUpperCase()
      mutations[push] = (state, value) => {
        return pushDeepValue(state, propPath, value)
      }
      // mutation name
      let splice = (conf.pattern === 'simple')
        ? propPath + '.splice'
        : 'SPLICE_' + propPath.toUpperCase()
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
