/**
 * Vuex Easy Access plugin
 * Unified syntax with simple set() and get() store access + auto generate mutations!
 *
 * @author     Luca Ban
 * @contact    https://lucaban.com
 */
import { IDefaultConfig } from './defaultConfig';
import { defaultMutations } from './makeMutations';
import { defaultGetter } from './makeGetters';
import { defaultSetter, defaultDeletor } from './makeSetters';
import { getDeepRef, getKeysFromPath } from './pathUtils';
/**
 * This will create the `/set/` sub-modules and add `set()` `get()` and `delete()` to the store object.
 *
 * @param {IDefaultConfig} [userConfig={}]
 * @returns {*} the store object
 */
declare function createEasyAccess(userConfig?: IDefaultConfig): any;
export default createEasyAccess;
export { createEasyAccess, defaultMutations, defaultGetter, defaultSetter, defaultDeletor, getDeepRef, getKeysFromPath };
