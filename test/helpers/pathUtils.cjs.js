'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isWhat = require('is-what');

var defaultConfig = {
    setter: 'set',
    getter: 'get',
    deletor: 'delete',
    vuexEasyFirestore: false,
    ignorePrivateProps: true,
    ignoreProps: [],
    pattern: 'simple'
};

/* eslint-disable */
function getErrors(conf, path, props) {
    var originInfo = (path || props) ? "problem with prop: `" + props + "` at path: `" + path + "`" : '';
    var tradPatt = (conf.pattern === 'traditional');
    var setter = conf.setter;
    var deletor = conf.deletor;
    var prop = 'items';
    var mutationNameSet = tradPatt ? 'SET_' + prop.toUpperCase() : prop;
    var mutationNameDel = tradPatt ? 'DELETE_' + prop.toUpperCase() : prop;
    var exampleSetters__Wildcard = "\n    Correct usage examples:\n    // From Vue-components:\n    " + setter + "('" + prop + ".*', {'123': {name: 'the best item'}})\n\n    // From the Vuex store:\n    dispatch('" + setter + "/" + prop + ".*', {'123': {name: 'the best item'}})\n    // or\n    commit('" + mutationNameSet + ".*', {'123': {name: 'the best item'}})";
    var exampleSetters__DoubleWildcard = "\n    Correct usage examples:\n    // From Vue-components:\n    " + setter + "('" + prop + ".*.tags.*', ['123', {water: true}])\n\n    // From the Vuex store:\n    dispatch('" + setter + "/" + prop + ".*.tags.*', ['123', {water: true}])\n    // or\n    commit('" + mutationNameSet + ".*.tags.*', ['123', {water: true}])";
    var exampleDeletor = "\n    Correct usage examples:\n    // From Vue-components:\n    " + deletor + "('" + prop + ".*', '123')\n\n    // From the Vuex store:\n    dispatch('" + deletor + "/" + prop + ".*', '123')\n    // or\n    commit('" + mutationNameDel + ".*', '123')";
    return {
        mutationSetterNoId: originInfo + "\n      The payload needs to be an object with an `id` field.\n      " + exampleSetters__Wildcard,
        mutationSetterPropPathWildcardMissingItemDoesntExist: originInfo + "\n      The item does not exist! Make sure you first set the item.\n      " + exampleSetters__Wildcard,
        mutationSetterPropPathWildcardIdCount: originInfo + "\n      The amount of ids and wildcards `'*'` are not equal.\n      If you have multiple wildcards you need to pass an array, where each item is an ID and the last is the property you want to set.\n      " + exampleSetters__DoubleWildcard + "\n      ",
        mutationDeleteNoId: originInfo + "\n      The payload needs to be an object with an `id` field.\n      " + exampleDeletor + "\n      ",
        wildcardFormatWrong: originInfo + "\n      There was something wrong with the payload passed when using a path with wildcards.\n\n      A) Path with wildcard:\n      " + exampleSetters__Wildcard + "\n\n      B) Path with multiple wildcards:\n      " + exampleSetters__DoubleWildcard + "\n    ",
        missingDeleteMutation: "\n      There is no mutation set for '" + path + "'.\n      Something went wrong with your vuex-easy-access setup.\n      Did you manually add `...defaultMutations(state)` to your modules?\n      See the documentation here:\n        https://github.com/mesqueeb/VuexEasyAccess#setup\n\n\n      // You can also manually add a mutation like so in the correct module (not recommended!!):\n      mutations: {\n        '" + (tradPatt ? 'DELETE_' + props.toUpperCase() : '-' + props) + "': (state, payload) => {\n          this._vm.$delete(state." + props + ")\n        }\n      }\n    ",
        missingSetterMutation: "\n      There is no mutation set for '" + path + "'.\n      Something went wrong with your vuex-easy-access setup.\n      Did you manually add `...defaultMutations(state)` to your modules?\n      See the documentation here:\n        https://github.com/mesqueeb/VuexEasyAccess#setup\n\n\n      // You can also manually add a mutation like so in the correct module (not recommended!!):\n      mutations: {\n        '" + (tradPatt ? 'SET_' + props.toUpperCase() : props) + "': (state, payload) => {\n          state." + props + " = payload\n        }\n      }\n    ",
    };
}
/**
 * Error logging
 *
 * @export
 * @param {string} error the error code
 * @param {object} conf the user config
 * @param {string} [path] (optional) the path the error occured in
 * @param {string} [props] (optional) the props the error occured with
 * @returns {string} the error code
 */
function error (error, conf, path, props) {
    if (conf === void 0) { conf = {}; }
    var mergedConf = Object.assign({}, defaultConfig, conf);
    var errorMessages = getErrors(mergedConf, path, props);
    console.error('[vuex-easy-access] Error!', errorMessages[error]);
    return error;
}

/**
 * gets an ID from a single piece of payload.
 *
 * @param {(object | ({ id: string } & object) | string)} payloadPiece
 * @param {object} [conf] (optional - for error handling) the vuex-easy-access config
 * @param {string} [path] (optional - for error handling) the path called
 * @param {(any[] | object | string)} [fullPayload] (optional - for error handling) the full payload on which each was `getId()` called
 * @returns {string} the id
 */
function getId(payloadPiece, conf, path, fullPayload) {
    if (isWhat.isObject(payloadPiece)) {
        if ('id' in payloadPiece)
            return payloadPiece.id;
        if (Object.keys(payloadPiece).length === 1)
            return Object.keys(payloadPiece)[0];
    }
    if (isWhat.isString(payloadPiece))
        return payloadPiece;
    error('wildcardFormatWrong', conf, path);
    return '';
}
/**
 * Get all ids from an array payload.
 *
 * @param {any[]} payload
 * @param {object} [conf] (optional - for error handling) the vuex-easy-access config
 * @param {string} [path] (optional - for error handling) the path called
 * @returns {string[]} all ids
 */
function getIdsFromPayload(payload, conf, path) {
    return payload.map(function (payloadPiece) { return getId(payloadPiece, conf, path); });
}
/**
 * Returns a value of a payload piece. Eg. {[id]: 'val'} will return 'val'
 *
 * @param {(object | string)} payloadPiece
 * @returns {any}
 */
function getValueFromPayloadPiece(payloadPiece) {
    if (isWhat.isObject(payloadPiece) &&
        !('id' in payloadPiece) &&
        Object.keys(payloadPiece).length === 1) {
        return Object.values(payloadPiece)[0];
    }
    return payloadPiece;
}
/**
 * Checks the ratio between an array of IDs and a path with wildcards
 *
 * @param {string[]} ids
 * @param {string} path
 * @param {object} [conf] (optional - for error handling) the vuex-easy-access config
 * @returns {boolean} true if no problem. false if the ratio is incorrect
 */
function checkIdWildcardRatio(ids, path, conf) {
    var match = path.match(/\*/g);
    var idCount = (isWhat.isArray(match))
        ? match.length
        : 0;
    if (ids.length === idCount)
        return true;
    error('mutationSetterPropPathWildcardIdCount', conf);
    return false;
}
/**
 * Fill in IDs at '*' in a path, based on the IDs received.
 *
 * @param {string[]} ids
 * @param {string} path 'path.*.with.*.wildcards'
 * @param {object} [state] RELATIVE TO PATH START! the state to check if the value actually exists
 * @param {object} [conf] (optional - for error handling) the vuex-easy-access config
 * @returns {string} The path with '*' replaced by IDs
 */
function fillinPathWildcards(ids, path, state, conf) {
    // Ignore pool check if '*' comes last
    var ignorePoolCheckOn = (path.endsWith('*')) ? ids[ids.length - 1] : null;
    ids.forEach(function (_id, _index, _array) {
        var idIndex = path.indexOf('*');
        var pathUntilPool = path.substring(0, idIndex);
        // check for errors when both state and conf are passed
        // pathUntilPool can be '' in case the path starts with '*'
        if (ignorePoolCheckOn !== _id && state && conf) {
            var pool = (pathUntilPool)
                ? getDeepRef(state, pathUntilPool)
                : state;
            if (pool[_id] === undefined)
                return error('mutationSetterPropPathWildcardMissingItemDoesntExist', conf, pathUntilPool, _id);
        }
        path = path
            .split('')
            .map(function (char, ind) { return ind === idIndex ? _id : char; })
            .join('');
    });
    return path;
}
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
function createObjectFromPath(path, payload, state, conf) {
    var _a;
    // edge cases
    if (path === '*')
        return payload;
    if (!path.includes('.') && !path.includes('/'))
        return _a = {}, _a[path] = payload, _a;
    // start
    var newValue = payload;
    if (path.includes('*')) {
        // only work with arrays
        if (!isWhat.isArray(payload))
            payload = [payload];
        var lastPayloadPiece = payload.pop();
        var ids = payload;
        // CASE: 'dex/pokemonById.*.tags'
        if (!path.endsWith('*')) {
            newValue = lastPayloadPiece;
        }
        // CASE: 'dex/pokemonById.*.tags.*'
        if (path.endsWith('*')) {
            var lastId = getId(lastPayloadPiece, conf, path);
            ids.push(lastId);
            newValue = getValueFromPayloadPiece(lastPayloadPiece);
            if (isWhat.isObject(newValue))
                newValue.id = lastId;
        }
        ids = ids.map(function (_id) {
            _id = _id.replace('.', '_____dot_____');
            _id = _id.replace('/', '_____slash_____');
            return _id;
        });
        if (!checkIdWildcardRatio(ids, path, conf))
            return;
        var pathWithIds = fillinPathWildcards(ids, path, state, conf);
        path = pathWithIds;
    }
    // important to set the result here and not return the reduce directly!
    var result = {};
    path.match(/[^\/^\.]+/g)
        .reduce(function (carry, _prop, index, array) {
        _prop = _prop.replace('_____dot_____', '.');
        _prop = _prop.replace('_____slash_____', '/');
        var container = (index === array.length - 1)
            ? newValue
            : {};
        carry[_prop] = container;
        return container;
    }, result);
    return result;
}
/**
 * Returns the keys of a path
 *
 * @param   {string} path   a/path/like.this
 * @returns {string[]} with keys
 */
function getKeysFromPath(path) {
    if (!path)
        return [];
    return path.match(/[^\/^\.]+/g);
}
/**
 * Gets a deep property in an object, based on a path to that property
 *
 * @param {object} target an object to wherefrom to retrieve the deep reference of
 * @param {string} path   'path/to.prop'
 * @returns {AnyObject} the last prop in the path
 */
function getDeepRef(target, path) {
    if (target === void 0) { target = {}; }
    var keys = getKeysFromPath(path);
    if (!keys.length)
        return target;
    var obj = target;
    while (obj && keys.length > 1) {
        obj = obj[keys.shift()];
    }
    var key = keys.shift();
    if (obj && obj.hasOwnProperty(key)) {
        return obj[key];
    }
}
/**
 * Gets a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to get the value of
 * @param   {string} path     'path/to/prop.subprop'
 * @returns {AnyObject}          the property's value
 */
function getDeepValue(target, path) {
    return getDeepRef(target, path);
}
/**
 * Sets a value to a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to set the value on
 * @param   {string} path     'path/to/prop.subprop'
 * @param   {*}      value    the value to set
 * @returns {AnyObject} the original target object
 */
function setDeepValue(target, path, value) {
    var keys = getKeysFromPath(path);
    var lastKey = keys.pop();
    var deepRef = getDeepRef(target, keys.join('.'));
    if (deepRef && deepRef.hasOwnProperty(lastKey)) {
        deepRef[lastKey] = value;
    }
    return target;
}
/**
 * Pushes a value in an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to push the value on
 * @param   {string} path     'path/to.sub.prop'
 * @param   {*}      value    the value to push
 * @returns {number}          the new length of the array
 */
function pushDeepValue(target, path, value) {
    var deepRef = getDeepRef(target, path);
    if (!isWhat.isArray(deepRef))
        return;
    return deepRef.push(value);
}
/**
 * Pops a value of an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to pop the value of
 * @param   {string} path     'path.to.sub.prop'
 * @returns {*}               the popped value
 */
function popDeepValue(target, path) {
    var deepRef = getDeepRef(target, path);
    if (!isWhat.isArray(deepRef))
        return;
    return deepRef.pop();
}
/**
 * Shift a value of an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to shift the value of
 * @param   {string} path     'path.to.sub.prop'
 * @returns {*}               the shifted value
 */
function shiftDeepValue(target, path) {
    var deepRef = getDeepRef(target, path);
    if (!isWhat.isArray(deepRef))
        return;
    return deepRef.shift();
}
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
function spliceDeepValue(target, path, index, deleteCount, value) {
    if (index === void 0) { index = 0; }
    if (deleteCount === void 0) { deleteCount = 0; }
    var deepRef = getDeepRef(target, path);
    if (!isWhat.isArray(deepRef))
        return;
    if (value === undefined)
        return deepRef.splice(index, deleteCount);
    return deepRef.splice(index, deleteCount, value);
}

exports.checkIdWildcardRatio = checkIdWildcardRatio;
exports.createObjectFromPath = createObjectFromPath;
exports.fillinPathWildcards = fillinPathWildcards;
exports.getDeepRef = getDeepRef;
exports.getDeepValue = getDeepValue;
exports.getIdsFromPayload = getIdsFromPayload;
exports.getKeysFromPath = getKeysFromPath;
exports.getValueFromPayloadPiece = getValueFromPayloadPiece;
exports.popDeepValue = popDeepValue;
exports.pushDeepValue = pushDeepValue;
exports.setDeepValue = setDeepValue;
exports.shiftDeepValue = shiftDeepValue;
exports.spliceDeepValue = spliceDeepValue;
