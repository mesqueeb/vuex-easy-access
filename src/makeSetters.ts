import { fillinPathWildcards, createObjectFromPath, getKeysFromPath, getIdsFromPayload, getDeepRef, pushDeepValue, popDeepValue, shiftDeepValue, spliceDeepValue } from './pathUtils'
import { isObject, isArray } from 'is-what'
import defaultConf from './defaultConfig'
import { IDefaultConfig, IInitialisedStore, AnyObject } from './declarations'
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
 * @param {string} path the path of the prop to set eg. 'info/user/favColours.primary'
 * @param {*} payload the payload to set the prop to
 * @param {IInitialisedStore} store the store to attach
 * @param {IDefaultConfig} [conf={}] user config
 * @returns {*} the dispatch or commit function
 */
export function defaultSetter (
  path: string,
  payload: any,
  store: IInitialisedStore,
  conf: IDefaultConfig = {}
): any {
  const {command, _path, _payload} = formatSetter(path, payload, store, conf)
  if (command === 'error') return _payload
  return store[command](_path, _payload)
}

export function formatSetter (
  path: string,
  payload: any,
  store: IInitialisedStore,
  conf: IDefaultConfig = {}
): {
  command: string,
  _path?: string,
  _payload?: any
} {
  const dConf: IDefaultConfig = Object.assign({}, defaultConf, conf)
  const pArr = path.split('/')                // ['info', 'user', 'favColours.primary']
  const props = pArr.pop()                    // 'favColours.primary'
  const modulePath = (pArr.length)
    ? pArr.join('/') + '/'                    // 'info/user/'
    : ''
  const setProp = (dConf.pattern === 'traditional')
    ? 'set' + props[0].toUpperCase() + props.substring(1) // 'setFavColours.primary'
    : props                                               // 'favColours.primary'
  // Check if an action exists, if it does, trigger that and return early!
  const moduleSetProp = modulePath + setProp
  const actionExists = store._actions[moduleSetProp]
  if (actionExists) {
    return {command: 'dispatch', _path: moduleSetProp, _payload: payload}
  }
  // [vuex-easy-firestore] check if it's a firestore module
  const fsModulePath = (!modulePath && props && !props.includes('.') && dConf.vuexEasyFirestore)
    ? props + '/'
    : modulePath
  const _module = store._modulesNamespaceMap[fsModulePath]
  const fsConf = (!_module) ? null : _module.state._conf
  if (dConf.vuexEasyFirestore && fsConf) {
    // 'info/user/set', {favColours: {primary: payload}}'
    const firestoreActionPath = fsModulePath + 'set'
    const firestoreActionExists = store._actions[firestoreActionPath]
    if (firestoreActionExists) {
      const fsPropName = fsConf.statePropName
      const fsProps = (fsPropName && props.startsWith(`${fsPropName}.`))
        ? props.replace(`${fsPropName}.`, '')
        : props
      const newPayload = (!fsProps || (!modulePath && fsProps && !fsProps.includes('.')))
        ? payload
        : createObjectFromPath(fsProps, payload)
      return {command: 'dispatch', _path: firestoreActionPath, _payload: newPayload}
    }
  }
  // Trigger the mutation!
  const SET_PROP = (dConf.pattern === 'traditional')
    ? 'SET_' + props.toUpperCase() // 'SET_FAVCOLOURS.PRIMARY'
    : props                        // 'favColours.primary'
  const MODULES_SET_PROP = modulePath + SET_PROP
  const mutationExists = store._mutations[MODULES_SET_PROP]
  if (mutationExists) {
    return {command: 'commit', _path: MODULES_SET_PROP, _payload: payload}
  }
  const triggeredError = error('missingSetterMutation', dConf, MODULES_SET_PROP, props)
  return {command: 'error', _payload: triggeredError}
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
 * @param {string} path the path of the prop to delete eg. 'info/user/favColours.primary'
 * @param {*} payload either nothing or an id or {id}
 * @param {IInitialisedStore} store the store to attach
 * @param {IDefaultConfig} [conf={}] user config
 * @returns {*} dispatch or commit
 */
export function defaultDeletor (
  path: string,
  payload: any,
  store: IInitialisedStore,
  conf: IDefaultConfig = {}
): any {
  const {command, _path, _payload} = formatDeletor(path, payload, store, conf)
  if (command === 'error') return _payload
  return store[command](_path, _payload)
}

export function formatDeletor (
  path: string,
  payload: any,
  store: IInitialisedStore,
  conf: IDefaultConfig = {}
): {
  command: string,
  _path?: string,
  _payload?: any
} {
  const dConf: IDefaultConfig = Object.assign({}, defaultConf, conf) // 'user/items.*.tags.*'
  const pArr = path.split('/')                // ['user', 'items.*.tags.*']
  const props = pArr.pop()                    // 'items.*.tags.*'
  const modulePath = (pArr.length)
    ? pArr.join('/') + '/'                    // 'user/'
    : ''
  const deleteProp = (dConf.pattern === 'traditional')
    ? 'delete' + props[0].toUpperCase() + props.substring(1) // 'deleteItems.*.tags.*'
    : '-' + props                                            // '-items.*.tags.*'
  // Check if an action exists, if it does, trigger that and return early!
  const moduleDeleteProp = modulePath + deleteProp
  const actionExists = store._actions[moduleDeleteProp]
  if (actionExists) {
    return {command: 'dispatch', _path: moduleDeleteProp, _payload: payload}
  }
  // [vuex-easy-firestore] check if it's a firestore module
  const _module = store._modulesNamespaceMap[modulePath]
  const fsConf = (!_module) ? null : _module.state._conf
  if (dConf.vuexEasyFirestore && fsConf) {
    // DOC: 'user/favColours.*', 'primary'
    // COLLECTION: 'items.*', '123'
    // COLLECTION: 'items.*.tags.*', ['123', 'dark']
    const fsPropName = fsConf.statePropName
    const fsProps = (fsPropName && props.startsWith(`${fsPropName}.`))
      ? props.replace(`${fsPropName}.`, '')
      : props
    let newPath = fsProps
    if (fsProps.includes('*')) {
      const idsPayload = (!isArray(payload)) ? [payload] : payload
      const ids = getIdsFromPayload(idsPayload)
      console.log('fsProps → ', fsProps)
      console.log('ids → ', ids)
      newPath = fillinPathWildcards(ids, fsProps)
      console.log('newPath → ', newPath)
    }
    if (newPath) return {command: 'dispatch', _path: modulePath + 'delete', _payload: newPath}
  }
  // Trigger the mutation!
  const DELETE_PROP = (dConf.pattern === 'traditional')
    ? 'DELETE_' + props.toUpperCase() // 'DELETE_ITEMS.*.TAGS.*'
    : '-' + props                     // '-items.*.tags.*'
  const MODULE_DELETE_PROP = modulePath + DELETE_PROP
  const mutationExists = store._mutations[MODULE_DELETE_PROP]
  if (mutationExists) {
    return {command: 'commit', _path: MODULE_DELETE_PROP, _payload: payload}
  }
  const triggeredError = error('missingDeleteMutation', dConf, MODULE_DELETE_PROP, props)
  return {command: 'error', _payload: triggeredError}
}

/**
 * Creates a special 'setter-module' to be registered as a child of a module. This 'setter-module' will have the 'set' namespace (by default) and have one setter action per state prop in the parent module. The setter action's name will be the state prop name.
 *
 * @param {AnyObject} targetState parent module's state object
 * @param {string} [moduleNS=''] parent module's namespace, must end in '/'
 * @param {IInitialisedStore} store vuex store
 * @param {IDefaultConfig} conf user config
 * @returns {*} a special 'setter-module' to be registered as child of target module.
 */
function createSetterModule (
  targetState: AnyObject,
  moduleNS: string = '',
  store: IInitialisedStore,
  conf: IDefaultConfig
): any {
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
 * @param {AnyObject} targetState parent module's state object
 * @param {string} [moduleNS=''] parent module's namespace, must end in '/'
 * @param {IInitialisedStore} store vuex store
 * @param {IDefaultConfig} conf user config
 * @returns {*} a special 'delete-module' to be registered as child of target module.
 */
function createDeleteModule (
  targetState: AnyObject,
  moduleNS: string = '',
  store: IInitialisedStore,
  conf: IDefaultConfig
): any {
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

/**
 * Generate all vuex-easy-access modules: `/set/` and `/delete/` for each module
 *
 * @export
 * @param {IInitialisedStore} store
 * @param {IDefaultConfig} [conf={}]
 */
export function generateSetterModules (
  store: IInitialisedStore,
  conf: IDefaultConfig = {}
): void {
  const modules = store._modulesNamespaceMap
  const dConf: IDefaultConfig = Object.assign({}, defaultConf, conf)
  Object.keys(modules).forEach(moduleNS => {
    const _module = modules[moduleNS]
    const moduleName = getKeysFromPath(moduleNS + dConf.setter)
    const setterModule = createSetterModule(_module.state, moduleNS, store, dConf)
    store.registerModule(moduleName, setterModule)
    const deleteModule = createDeleteModule(_module.state, moduleNS, store, dConf)
    const deleteModuleName = getKeysFromPath(moduleNS + dConf.deletor)
    store.registerModule(deleteModuleName, deleteModule)
  })
  const rootModuleName = dConf.setter
  const rootSetterModule = createSetterModule(store.state, '', store, dConf)
  store.registerModule(rootModuleName, rootSetterModule)
  const rootDeleteModuleName = dConf.deletor
  const rootDeleteModule = createDeleteModule(store.state, '', store, dConf)
  store.registerModule(rootDeleteModuleName, rootDeleteModule)
}
