import { IDefaultConfig, AnyObject } from './declarations';
interface IInfoNS {
    moduleNamespace: string;
}
/**
 * Creates all mutations for the state of a module.
 * Usage:
 * commit('module/path/SET_PATH.TO.PROP', newValue)
 * Import method:
 * mutations {
 *   ...defaultMutations(initialState)
 * }
 *
 * @param {object} initialState the initial state of a module
 * @param {IDefaultConfig} [userConf={}] (optional) user config
 * @param {IInfoNS} [infoNS] (optional) info on the module namespace
 * @returns {AnyObject} all mutations for the state
 */
export declare function defaultMutations(initialState: object, userConf?: IDefaultConfig, infoNS?: IInfoNS): AnyObject;
export {};
