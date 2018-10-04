/**
 * Vuex Easy Access plugin
 * Unified syntax with simple set() and get() store access + auto generate mutations!
 *
 * @author     Luca Ban
 * @contact    https://lucaban.com
 */

import defaultConfig from './defaultConfig'
import { IDefaultConfig } from './defaultConfig'
import { defaultMutations } from './makeMutations'
import { defaultGetter } from './makeGetters'
import { defaultSetter, defaultDeletor, generateSetterModules } from './makeSetters'
import { getDeepRef, getKeysFromPath } from './pathUtils'

/**
 * This will create the `/set/` sub-modules and add `set()` `get()` and `delete()` to the store object.
 *
 * @param {IDefaultConfig} [userConfig={}]
 * @returns {*} the store object
 */
function createEasyAccess (userConfig: IDefaultConfig = {}): any {
  const conf = Object.assign({}, defaultConfig, userConfig)
  return store => {
    generateSetterModules(store, conf)
    store[conf.setter] = (path, payload) => { return defaultSetter(path, payload, store, conf) }
    store[conf.getter] = (path) => { return defaultGetter(path, store) }
    store[conf.deletor] = (path, payload) => { return defaultDeletor(path, payload, store, conf) }
  }
}

export default createEasyAccess
export { createEasyAccess, defaultMutations, defaultGetter, defaultSetter, defaultDeletor, getDeepRef, getKeysFromPath }
