import { AnyObject } from './declarations';
/**
 * Get all ids from an array payload.
 *
 * @param {any[]} payload
 * @param {object} [conf] (optional - for error handling) the vuex-easy-access config
 * @param {string} [path] (optional - for error handling) the path called
 * @returns {string[]} all ids
 */
export declare function getIdsFromPayload(payload: any[], conf?: object, path?: string): string[];
/**
 * Returns a value of a payload piece. Eg. {[id]: 'val'} will return 'val'
 *
 * @param {(object | string)} payloadPiece
 * @returns {any}
 */
export declare function getValueFromPayloadPiece(payloadPiece: object | string): any;
/**
 * Checks the ratio between an array of IDs and a path with wildcards
 *
 * @param {string[]} ids
 * @param {string} path
 * @param {object} [conf] (optional - for error handling) the vuex-easy-access config
 * @returns {boolean} true if no problem. false if the ratio is incorrect
 */
export declare function checkIdWildcardRatio(ids: string[], path: string, conf: object): boolean;
/**
 * Fill in IDs at '*' in a path, based on the IDs received.
 *
 * @param {string[]} ids
 * @param {string} path 'path.*.with.*.wildcards'
 * @param {object} [state] RELATIVE TO PATH START! the state to check if the value actually exists
 * @param {object} [conf] (optional - for error handling) the vuex-easy-access config
 * @returns {string} The path with '*' replaced by IDs
 */
export declare function fillinPathWildcards(ids: string[], path: string, state?: object, conf?: object): string;
/**
 * ('/sub.prop', payload) becomes →  {sub: {prop: payload}}
 * ('sub', payload) becomes →  {sub: payload}
 *
 * @param   {string} path     'a/path/like.this'
 * @param   {*}      payload
 * @param   {object} [state] the state to check if the value actually exists
 * @param   {object} [conf] (optional - for error handling) the vuex-easy-access config
 * @returns {AnyObject} a nested object re-created based on the path & payload
 */
export declare function createObjectFromPath(path: string, payload: any, state?: object, conf?: object): AnyObject;
/**
 * Returns the keys of a path
 *
 * @param   {string} path   a/path/like.this
 * @returns {string[]} with keys
 */
export declare function getKeysFromPath(path: string): string[];
/**
 * Gets a deep property in an object, based on a path to that property
 *
 * @param {object} target an object to wherefrom to retrieve the deep reference of
 * @param {string} path   'path/to.prop'
 * @returns {AnyObject} the last prop in the path
 */
export declare function getDeepRef(target: object, path: string): AnyObject;
/**
 * Gets a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to get the value of
 * @param   {string} path     'path/to/prop.subprop'
 * @returns {AnyObject}          the property's value
 */
export declare function getDeepValue(target: object, path: string): AnyObject;
/**
 * Sets a value to a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to set the value on
 * @param   {string} path     'path/to/prop.subprop'
 * @param   {*}      value    the value to set
 * @returns {AnyObject} the original target object
 */
export declare function setDeepValue(target: object, path: string, value: any): AnyObject;
/**
 * Pushes a value in an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to push the value on
 * @param   {string} path     'path/to.sub.prop'
 * @param   {*}      value    the value to push
 * @returns {number}          the new length of the array
 */
export declare function pushDeepValue(target: object, path: string, value: any): number;
/**
 * Pops a value of an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to pop the value of
 * @param   {string} path     'path.to.sub.prop'
 * @returns {*}               the popped value
 */
export declare function popDeepValue(target: object, path: string): any;
/**
 * Shift a value of an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to shift the value of
 * @param   {string} path     'path.to.sub.prop'
 * @returns {*}               the shifted value
 */
export declare function shiftDeepValue(target: object, path: string): any;
/**
 * Splice into an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target       the Object to splice the value of
 * @param   {string} path         'path/to.sub.prop'
 * @param   {number} [index=0]        the index to splice in the value, defaults to 0
 * @param   {number} [deleteCount=0]  the amount of items to delete, defaults to 0
 * @param   {*}      value        the value to splice in
 * @returns {any[]}              an array containing the deleted elements
 */
export declare function spliceDeepValue(target: object, path: string, index: number, deleteCount: number, value: any): any[];
