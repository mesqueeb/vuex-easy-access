import { IDefaultConfig, IInitialisedStore } from './declarations';
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
export declare function defaultSetter(path: string, payload: any, store: IInitialisedStore, conf?: IDefaultConfig): any;
export declare function formatSetter(path: string, payload: any, store: IInitialisedStore, conf?: IDefaultConfig): {
    command: string;
    _path?: string;
    _payload?: any;
};
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
export declare function defaultDeletor(path: string, payload: any, store: IInitialisedStore, conf?: IDefaultConfig): any;
export declare function formatDeletor(path: string, payload: any, store: IInitialisedStore, conf?: IDefaultConfig): {
    command: string;
    _path?: string;
    _payload?: any;
};
/**
 * Generate all vuex-easy-access modules: `/set/` and `/delete/` for each module
 *
 * @export
 * @param {IInitialisedStore} store
 * @param {IDefaultConfig} [conf={}]
 */
export declare function generateSetterModules(store: IInitialisedStore, conf?: IDefaultConfig): void;
