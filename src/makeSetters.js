import { getKeysFromPath, setDeepValue, getDeepRef } from './objectDeepValueUtils'
import { isObject } from 'is-what'
import defaultConf from './defaultConfig'

/**
 * Creates a setter function in the store to set any state value
 * Usage:
 * `set('module/path/path.to.prop', newValue)`
 * it will check first for existence of: `dispatch('module/path/setPath.to.prop')`
 * if non existant it will execute: `commit('module/path/SET_PATH.TO.PROP', newValue)`
 * Import method:
 * `store.set = (path, payload) => { return defaultSetter(path, payload, store) }`
 *
 * @param   {string}   path     the path of the prop to set eg. 'info/user/favColours.primary'
 * @param   {*}        payload  the payload to set the prop to
 * @param   {object}   store    the store to attach
 * @param   {object}   conf     user config
 *
 * @returns {function}          dispatch or commit
 */
function defaultSetter (path, payload, store, conf = {}) {
  conf = Object.assign({}, defaultConf, conf)
  // path = 'info/user/favColours.primary'
  const pArr = path.split('/')
  // ['info', 'user', 'favColours.primary']
  const props = pArr.pop()
  // 'favColours.primary'
  const modulePath = (pArr.length)
    ? pArr.join('/') + '/'
    : ''
  // 'info/user/'
  const actionName = (conf.pattern === 'simple')
    ? props
    : 'set' + props[0].toUpperCase() + props.substring(1)
  // 'setFavColours.primary'
  const actionPath = modulePath + actionName
  // 'info/user/setFavColours.primary'
  const actionExists = store._actions[actionPath]
  if (actionExists) {
    return store.dispatch(actionPath, payload)
  }
  if (conf.vuexEasyFirestore) {
    // 'info/user/set', {favColours: {primary: payload}}'
    const pathIsModule = store._modulesNamespaceMap[path + '/']
    const firestoreActionPath = (pathIsModule)
      ? path + '/set'
      : modulePath + 'set'
    const newPayload = (pathIsModule)
      ? payload
      : {}
    if (!pathIsModule) newPayload[props] = payload
    const firestoreActionExists = store._actions[firestoreActionPath]
    if (firestoreActionExists) {
      return store.dispatch(firestoreActionPath, newPayload)
    }
  }
  const mutationName = (conf.pattern === 'simple')
    ? props
    : 'SET_' + props.toUpperCase()
  const mutationPath = modulePath + mutationName
  const mutationExists = store._mutations[mutationPath]
  if (mutationExists) {
    return store.commit(mutationPath, payload)
  }
  console.error(`There is no mutation set for '${mutationPath}'.
    Please add a mutation like so in the correct module:

    mutations: {
      '${mutationName}': ({state}, payload) => {
        state.${props} = payload
      }
    }

    You can also add mutations automatically with vuex-easy-access.
    See the documentation here:
      https://github.com/mesqueeb/VuexEasyAccess#2-automatically-generate-mutations-for-each-state-property`
  )
}

/**
 * Creates a special 'setter-module' to be registered as a child of a module. This 'setter-module' will have the 'set' namespace (by default) and have one setter action per state prop in the parent module. The setter action's name will be the state prop name.
 *
 * @param {object} targetState   parent module's state object
 * @param {string} [moduleNS=''] parent module's namespace, must end in '/'
 * @param {object} store         vuex store
 * @param {object} conf          user config
 * @returns a special 'setter-module' to be registered as child of target module.
 */
function createSetterModule (targetState, moduleNS = '', store, conf = {}) {
  conf = Object.assign({}, defaultConf, conf)
  function getSetters (_targetState, _propPath = '') {
    return Object.keys(_targetState).reduce((carry, stateProp) => {
      // Get the path info up until this point
      const propPath = (_propPath)
        ? _propPath + '.' + stateProp
        : stateProp
      const fullPath = moduleNS + propPath
      // Avoid making setters for private props
      if (conf.ignorePrivateProps && stateProp[0] === '_') return carry
      if (conf.ignoreProps.includes(fullPath)) return carry
      // Avoid making setters for props which are an entire module on its own
      if (store._modulesNamespaceMap[fullPath + '/']) return carry
      // All good, make the action!
      carry[propPath] = (context, payload) => {
        return defaultSetter(fullPath, payload, store, conf)
      }
      // BTW, check if the value of this prop was an object, if so, let's do it's children as well!
      let propVal = _targetState[stateProp]
      if (isObject(propVal) && Object.keys(propVal).length) {
        const childrenSetters = getSetters(propVal, propPath)
        Object.assign(carry, childrenSetters)
      }
      return carry
    }, {})
  }
  const setters = getSetters(targetState)
  return {actions: setters, namespaced: true}
}

// if everything's namespaced _modulesNameSpaceMap will work just fine.
// function getModulesNameSpaceMap (_module, ns = '') {
//   if (!_module || !_module._children) return console.log(_module)
//   return Object.keys(_module._children).reduce((carry, key) => {
//     const childModule = _module._children[key]
//     const moduleNS = ns + key + '/'
//     carry[moduleNS] = childModule
//     const childrensModules = getModulesNameSpaceMap(childModule, moduleNS)
//     Object.assign(carry, childrensModules)
//     return carry
//   }, {})
// }

function generateSetterModules (store, setterIdentifier, conf = {}) {
  const modules = store._modulesNamespaceMap
  Object.keys(modules).forEach(moduleNS => {
    const _module = modules[moduleNS]
    const moduleName = getKeysFromPath(moduleNS + setterIdentifier)
    const setterModule = createSetterModule(_module.state, moduleNS, store, conf)
    store.registerModule(moduleName, setterModule)
  })
  conf = Object.assign({}, defaultConf, conf)
  const rootModuleName = setterIdentifier
  const rootSetterModule = createSetterModule(store.state, '', store, conf)
  store.registerModule(rootModuleName, rootSetterModule)
}

export { defaultSetter, generateSetterModules }
