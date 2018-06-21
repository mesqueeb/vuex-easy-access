/**
 * Vuex Easy Access plugin
 * Unified syntax with simple set() and get() store access + auto generate mutations!
 *
 * @author     Luca Ban
 * @contact    https://lucaban.com
 */

import { defaultMutations, defaultSetter, defaultGetter } from './storeAccess'
import { getDeepRef, getKeysFromPath } from './objectDeepValueUtils'

module.exports = { defaultMutations, defaultSetter, defaultGetter, getDeepRef, getKeysFromPath }
