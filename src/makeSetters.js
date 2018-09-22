import { fillinPathWildcards, createObjectFromPath, getKeysFromPath, getDeepRef, pushDeepValue, popDeepValue, shiftDeepValue, spliceDeepValue } from './pathUtils'
import { isObject, isArray } from 'is-what'
import defaultConf from './defaultConfig'
import error from './errors'

/**
 * Creates a setter function in the store to set any state value
 * Usage:
 * `set('module/path/path.to.prop', newValue)`
 * it will check first for existence of: `dispatch('module/path/path.to.prop')`
 * if non existant it will execute: `commit('module/path/path.to.prop', newValue)`
 * Import method:
 * `store.set = (path, payload) => { return defaultSetter(path, payload, store, conf) }`
 *
 * @param   {string}   path     the path of the prop to set eg. 'info/user/favColours.primary'
 * @param   {*}        payload  the payload to set the prop to
 * @param   {object}   store    the store to attach
 * @param   {object}   conf     user config
 *
 * @returns {function}          dispatch or commit
 */
function defaultSetter (path, payload, store, conf = {}) {
  conf = Object.assign({}, defaultConf, conf) // 'info/user/favColours.primary'
  const pArr = path.split('/')                // ['info', 'user', 'favColours.primary']
  const props = pArr.pop()                    // 'favColours.primary'
  const modulePath = (pArr.length)
    ? pArr.join('/') + '/'                    // 'info/user/'
    : ''
  const setProp = (conf.pattern === 'traditional')
    ? 'set' + props[0].toUpperCase() + props.substring(1) // 'setFavColours.primary'
    : props                                               // 'favColours.primary'
  // Check if an action exists, if it does, trigger that and return early!
  const moduleSetProp = modulePath + setProp
  const actionExists = store._actions[moduleSetProp]
  if (actionExists) {
    return store.dispatch(moduleSetProp, payload)
  }
  // [vuex-easy-firestore] check if it's a firestore module
  const fsModulePath = (!modulePath && props && !props.includes('.') && conf.vuexEasyFirestore)
    ? props + '/'
    : modulePath
  const _module = store._modulesNamespaceMap[fsModulePath]
  const fsConf = (!_module) ? null : _module.state._conf
  if (conf.vuexEasyFirestore && fsConf) {
    // 'info/user/set', {favColours: {primary: payload}}'
    const fsPropName = fsConf.statePropName
    const fsProps = (fsPropName && props.startsWith(`${fsPropName}.`))
      ? props.replace(`${fsPropName}.`, '')
      : props
    const newPayload = (!fsProps || (!modulePath && fsProps && !fsProps.includes('.')))
      ? payload
      : createObjectFromPath(fsProps, payload, _module.state, conf)
    const firestoreActionPath = fsModulePath + 'set'
    const firestoreActionExists = store._actions[firestoreActionPath]
    if (firestoreActionExists) {
      return store.dispatch(firestoreActionPath, newPayload)
    }
  }
  // Trigger the mutation!
  const SET_PROP = (conf.pattern === 'traditional')
    ? 'SET_' + props.toUpperCase() // 'SET_FAVCOLOURS.PRIMARY'
    : props                        // 'favColours.primary'
  const MODULES_SET_PROP = modulePath + SET_PROP
  const mutationExists = store._mutations[MODULES_SET_PROP]
  if (mutationExists) {
    return store.commit(MODULES_SET_PROP, payload)
  }
  return error('missingSetterMutation', conf, MODULES_SET_PROP, props)
}

/**
 * Creates a delete function in the store to delete any prop from a value
 * Usage:
 * `delete('module/path/path.to.prop', id)` will delete prop[id]
 * `delete('module/path/path.to.prop.*', {id})` will delete prop[id]
 * it will check first for existence of: `dispatch('module/path/-path.to.prop')` or `dispatch('module/path/-path.to.prop.*')`
 * if non existant it will execute: `commit('module/path/-path.to.prop')` or `commit('module/path/-path.to.prop.*')`
 * Import method:
 * `store.delete = (path, payload) => { return defaultDeletor(path, payload, store, conf) }`
 *
 * @param   {string}   path     the path of the prop to delete eg. 'info/user/favColours.primary'
 * @param   {*}        payload  either nothing or an id or {id}
 * @param   {object}   store    the store to attach
 * @param   {object}   conf     user config
 *
 * @returns {function}          dispatch or commit
 */
function defaultDeletor (path, payload, store, conf = {}) {
  conf = Object.assign({}, defaultConf, conf) // 'user/items.*.tags.*'
  const pArr = path.split('/')                // ['user', 'items.*.tags.*']
  const props = pArr.pop()                    // 'items.*.tags.*'
  const modulePath = (pArr.length)
    ? pArr.join('/') + '/'                    // 'user/'
    : ''
  const deleteProp = (conf.pattern === 'traditional')
    ? 'delete' + props[0].toUpperCase() + props.substring(1) // 'deleteItems.*.tags.*'
    : '-' + props                                            // '-items.*.tags.*'
  // Check if an action exists, if it does, trigger that and return early!
  const moduleDeleteProp = modulePath + deleteProp
  const actionExists = store._actions[moduleDeleteProp]
  if (actionExists) {
    return store.dispatch(moduleDeleteProp, payload)
  }
  // [vuex-easy-firestore] check if it's a firestore module
  const _module = store._modulesNamespaceMap[modulePath]
  const fsConf = (!_module) ? null : _module.state._conf
  if (conf.vuexEasyFirestore && fsConf) {
    // DOC: 'user/favColours.*', 'primary'
    // COLLECTION: 'items.*', '123'
    // COLLECTION: 'items.*.tags.*', ['123', 'dark']
    const fsPropName = fsConf.statePropName
    const fsProps = (fsPropName && props.startsWith(`${fsPropName}.`))
      ? props.replace(`${fsPropName}.`, '')
      : props
    let newPath = fsProps
    if (fsProps.includes('*')) {
      const ids = (!isArray(payload)) ? [payload] : payload
      newPath = fillinPathWildcards(ids, fsProps, _module.state, conf)
    }
    if (newPath) return store.dispatch(modulePath + 'delete', newPath)
  }
  // Trigger the mutation!
  const DELETE_PROP = (conf.pattern === 'traditional')
    ? 'DELETE_' + props.toUpperCase() // 'DELETE_ITEMS.*.TAGS.*'
    : '-' + props                     // '-items.*.tags.*'
  const MODULE_DELETE_PROP = modulePath + DELETE_PROP
  const mutationExists = store._mutations[MODULE_DELETE_PROP]
  if (mutationExists) {
    return store.commit(MODULE_DELETE_PROP, payload)
  }
  return error('missingDeleteMutation', conf, MODULE_DELETE_PROP, props)
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
      const PROP_SUBPROP = (_propPath)
        ? _propPath + '.' + stateProp
        : stateProp
      const MODULE_PROP_SUBPROP = moduleNS + PROP_SUBPROP
      // Avoid making setters for private props
      if (conf.ignorePrivateProps && stateProp[0] === '_') return carry
      if (conf.ignoreProps.includes(MODULE_PROP_SUBPROP)) return carry
      // Avoid making setters for props which are an entire module on its own
      if (store._modulesNamespaceMap[MODULE_PROP_SUBPROP + '/']) return carry
      // =================================================>
      //   NORMAL SETTER
      // =================================================>
      // All good, make the action!
      carry[PROP_SUBPROP] = (context, payload) => {
        return defaultSetter(MODULE_PROP_SUBPROP, payload, store, conf)
      }
      // Get the value of the prop
      const propValue = _targetState[stateProp]
      // =================================================>
      //   ARRAY SETTERS
      // =================================================>
      if (isArray(propValue)) {
        carry[PROP_SUBPROP + '.push'] = (context, payload) => {
          return defaultSetter(MODULE_PROP_SUBPROP + '.push', payload, store, conf)
        }
        carry[PROP_SUBPROP + '.pop'] = (context, payload) => {
          return defaultSetter(MODULE_PROP_SUBPROP + '.pop', payload, store, conf)
        }
        carry[PROP_SUBPROP + '.shift'] = (context, payload) => {
          return defaultSetter(MODULE_PROP_SUBPROP + '.shift', payload, store, conf)
        }
        carry[PROP_SUBPROP + '.splice'] = (context, payload) => {
          return defaultSetter(MODULE_PROP_SUBPROP + '.splice', payload, store, conf)
        }
      }
      // =================================================>
      //   WILDCARDS SETTER
      // =================================================>
      // if (isObject(propValue) && !Object.keys(propValue).length) {
      //   carry[PROP_SUBPROP + '.*'] = (context, payload) => {
      //     return defaultSetter(MODULE_PROP_SUBPROP + '.*', payload, store, conf)
      //   }
      // }
      // =================================================>
      //   CHILDREN SETTERS
      // =================================================>
      // let's do it's children as well!
      if (isObject(propValue) && Object.keys(propValue).length) {
        const childrenSetters = getSetters(propValue, PROP_SUBPROP)
        Object.assign(carry, childrenSetters)
      }
      return carry
    }, {})
  }
  const setters = getSetters(targetState)
  return {actions: setters, namespaced: true}
}

/**
 * Creates a special 'delete-module' to be registered as a child of a module. This 'delete-module' will have the 'delete' namespace (by default) and have one delete action per state prop in the parent module which holds an empty object. The delete action's name will be the state prop name + `.*`.
 *
 * @param {object} targetState   parent module's state object
 * @param {string} [moduleNS=''] parent module's namespace, must end in '/'
 * @param {object} store         vuex store
 * @param {object} conf          user config
 * @returns a special 'delete-module' to be registered as child of target module.
 */
function createDeleteModule (targetState, moduleNS = '', store, conf = {}) {
  conf = Object.assign({}, defaultConf, conf)
  function getDeletors (_targetState, _propPath = '') {
    return Object.keys(_targetState).reduce((carry, stateProp) => {
      // Get the path info up until this point
      const PROP_SUBPROP = (_propPath)
        ? _propPath + '.' + stateProp
        : stateProp
      const MODULE_PROP_SUBPROP = moduleNS + PROP_SUBPROP
      // Avoid making deletor for private props
      if (conf.ignorePrivateProps && stateProp[0] === '_') return carry
      if (conf.ignoreProps.includes(MODULE_PROP_SUBPROP)) return carry
      // Avoid making deletor for props which are an entire module on its own
      if (store._modulesNamespaceMap[MODULE_PROP_SUBPROP + '/']) return carry
      // Get the value of the prop
      const propValue = _targetState[stateProp]
      carry[PROP_SUBPROP] = (context, payload) => {
        return defaultDeletor(MODULE_PROP_SUBPROP, payload, store, conf)
      }
      // let's do it's children as well!
      if (isObject(propValue) && Object.keys(propValue).length) {
        const childrenDeletors = getDeletors(propValue, PROP_SUBPROP)
        Object.assign(carry, childrenDeletors)
      }
      return carry
    }, {})
  }
  const deletors = getDeletors(targetState)
  return {actions: deletors, namespaced: true}
}

function generateSetterModules (store, conf = {}) {
  const modules = store._modulesNamespaceMap
  conf = Object.assign({}, defaultConf, conf)
  Object.keys(modules).forEach(moduleNS => {
    const _module = modules[moduleNS]
    const moduleName = getKeysFromPath(moduleNS + conf.setter)
    const setterModule = createSetterModule(_module.state, moduleNS, store, conf)
    store.registerModule(moduleName, setterModule)
    const deleteModule = createDeleteModule(_module.state, moduleNS, store, conf)
    const deleteModuleName = getKeysFromPath(moduleNS + conf.deletor)
    store.registerModule(deleteModuleName, deleteModule)
  })
  const rootModuleName = conf.setter
  const rootSetterModule = createSetterModule(store.state, '', store, conf)
  store.registerModule(rootModuleName, rootSetterModule)
  const rootDeleteModuleName = conf.deletor
  const rootDeleteModule = createDeleteModule(store.state, '', store, conf)
  store.registerModule(rootDeleteModuleName, rootDeleteModule)
}

export { defaultSetter, defaultDeletor, generateSetterModules }
