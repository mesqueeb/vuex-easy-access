/**
 * Vuex Easy Access plugin
 * Unified syntax with simple set() and get() store access + auto generate mutations!
 *
 * @author     Luca Ban
 * @contact    https://lucaban.com
 */

import { defaultMutations, defaultSetter, defaultGetter } from './storeAccess'
import defaultConfig from './defaultConfig'
import { getDeepRef, getKeysFromPath } from './objectDeepValueUtils'

function createEasyAccess (userConfig) {
  const conf = Object.assign(defaultConfig, userConfig)
  const vuexEasyFirestore = conf.vuexEasyFirestore
  return store => {
    store[conf.setter] = (path, payload) => { return defaultSetter(path, payload, store, vuexEasyFirestore) }
    store[conf.getter] = (path) => { return defaultGetter(path, store) }
  }
}

export default createEasyAccess
export { createEasyAccess, defaultMutations, defaultSetter, defaultGetter, getDeepRef, getKeysFromPath }
