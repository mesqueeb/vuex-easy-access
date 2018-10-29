'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var isWhat = require('is-what');
var Vue = _interopDefault(require('vue'));
var merge = _interopDefault(require('merge-anything'));

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
    return payload.map(function (payloadPiece) { return getId(payloadPiece, conf, path, payload); });
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
 * @param {object} state RELATIVE TO PATH START! the state to check if the value actually exists
 * @param {object} conf (optional - for error handling) the vuex-easy-access config
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
 *
 * @param   {string} path     'a/path/like.this'
 * @param   {*}      payload
 * @param   {object} state the state to check if the value actually exists
 * @param   {object} conf (optional - for error handling) the vuex-easy-access config
 * @returns {AnyObject} a nested object re-created based on the path & payload
 */
function createObjectFromPath(path, payload, state, conf) {
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

// define possible functions
// eslint-disable-next-line
function SET_PROP_SUBPROP(state, payload, PROP_SUBPROP) {
    return setDeepValue(state, PROP_SUBPROP, payload);
}
// eslint-disable-next-line
function DELETE_PROP_SUBPROP(state, PROP_SUBPROP) {
    var propsArray = (PROP_SUBPROP.includes('.'))
        ? PROP_SUBPROP.split('.')
        : [PROP_SUBPROP];
    var lastProp = propsArray.pop();
    var propsWithoutLast = propsArray.join('.');
    var ref = getDeepRef(state, propsWithoutLast);
    return Vue.delete(ref, lastProp);
}
// eslint-disable-next-line
function MUTATE_PROP_x_SUBPROP(state, payload, PROP_SUBPROP, conf) {
    if (!isWhat.isArray(payload))
        payload = [payload];
    var newValue = payload.pop();
    var ids = getIdsFromPayload(payload, conf, PROP_SUBPROP);
    if (!checkIdWildcardRatio(ids, PROP_SUBPROP, conf))
        return;
    var pathWithIds = fillinPathWildcards(ids, PROP_SUBPROP, state, conf);
    return setDeepValue(state, pathWithIds, newValue);
}
// eslint-disable-next-line
function DELETE_PROP_x_SUBPROP(state, payload, PROP_SUBPROP, conf) {
    var propsArray = (PROP_SUBPROP.includes('.'))
        ? PROP_SUBPROP.split('.')
        : [PROP_SUBPROP];
    var lastProp = propsArray.pop();
    var propsWithoutLast = propsArray.join('.');
    var ids = payload;
    if (!checkIdWildcardRatio(ids, propsWithoutLast, conf))
        return;
    var pathWithIds = fillinPathWildcards(ids, propsWithoutLast, state, conf);
    var ref = getDeepRef(state, pathWithIds);
    return Vue.delete(ref, lastProp);
}
// eslint-disable-next-line
function MUTATE_PROP_x(state, payload, PROP_SUBPROP, conf, propValue) {
    if (!isWhat.isArray(payload))
        payload = [payload];
    var ids = getIdsFromPayload(payload, conf, PROP_SUBPROP);
    if (!checkIdWildcardRatio(ids, PROP_SUBPROP, conf))
        return;
    var lastId = ids.pop();
    var propPathWithoutLast = PROP_SUBPROP.slice(0, -1);
    var pathWithIds = fillinPathWildcards(ids, propPathWithoutLast, state, conf);
    var ref = getDeepRef(state, pathWithIds);
    var newValue = getValueFromPayloadPiece(payload.pop());
    if (isWhat.isObject(newValue))
        newValue.id = lastId;
    if (isWhat.isObject(propValue))
        newValue = merge(propValue, newValue);
    return Vue.set(ref, lastId, newValue);
}
// eslint-disable-next-line
function DELETE_PROP_x(state, id, PROP_SUBPROP, conf) {
    if (!id)
        return error('mutationDeleteNoId', conf, PROP_SUBPROP);
    var ids = (!isWhat.isArray(id)) ? [id] : id;
    if (!checkIdWildcardRatio(ids, PROP_SUBPROP, conf))
        return;
    var lastId = ids.pop();
    var pathWithoutWildcard = (PROP_SUBPROP.endsWith('*'))
        ? PROP_SUBPROP.slice(0, -1)
        : PROP_SUBPROP;
    var pathWithIds = fillinPathWildcards(ids, pathWithoutWildcard, state, conf);
    var ref = getDeepRef(state, pathWithIds);
    return Vue.delete(ref, lastId);
}
// execute mutation
function executeArrayMutation(state, payload, action, PROP_SUBPROP, conf) {
    var newValue, pathWithIds;
    if (!PROP_SUBPROP.includes('*')) {
        newValue = payload;
        pathWithIds = PROP_SUBPROP;
    }
    else {
        if (!isWhat.isArray(payload) && action !== 'splice')
            payload = [payload];
        if (action !== 'pop' && action !== 'shift')
            newValue = payload.pop();
        var ids = getIdsFromPayload(payload, conf, PROP_SUBPROP);
        if (!checkIdWildcardRatio(ids, PROP_SUBPROP, conf))
            return;
        pathWithIds = fillinPathWildcards(ids, PROP_SUBPROP, state, conf);
    }
    if (action === 'push') {
        return pushDeepValue(state, pathWithIds, newValue);
    }
    if (action === 'pop') {
        return popDeepValue(state, pathWithIds);
    }
    if (action === 'shift') {
        return shiftDeepValue(state, pathWithIds);
    }
    if (action === 'splice') {
        var index = newValue[0];
        var deleteCount = newValue[1];
        var value = newValue[2];
        return spliceDeepValue(state, pathWithIds, index, deleteCount, value);
    }
}
/**
 * Creates the mutations for each property of the object passed recursively
 *
 * @param   {object} propParent an Object of which all props will get a mutation
 * @param   {(string | null)} path the path taken until the current propParent instance
 * @param   {IDefaultConfig} conf user config
 * @param   {string} [infoNS] (optional) module namespace in light of ignoreProps config
 *
 * @returns {AnyObject} all mutations for each property.
 */
function makeMutationsForAllProps(propParent, path, conf, infoNS) {
    if (!isWhat.isObject(propParent))
        return {};
    return Object.keys(propParent)
        .reduce(function (mutations, prop) {
        // Get the path info up until this point
        var PROP_SUBPROP = (!path)
            ? prop
            : path + '.' + prop;
        // Avoid making setters for private props
        if (conf.ignorePrivateProps && prop[0] === '_')
            return mutations;
        if (conf.ignoreProps.some(function (ignPropFull) {
            var separatePropFromNS = /(.*?)\/([^\/]*?)$/.exec(ignPropFull);
            var ignPropNS = (separatePropFromNS) ? separatePropFromNS[1] + '/' : '';
            var ignProp = (separatePropFromNS) ? separatePropFromNS[2] : ignPropFull;
            return ((!infoNS && ignProp === PROP_SUBPROP) ||
                (infoNS && infoNS.moduleNamespace === ignPropNS && ignProp === PROP_SUBPROP));
        })) {
            return mutations;
        }
        // Get the value of the prop
        var propValue = propParent[prop];
        // =================================================>
        //   SET & DELETE MUTATION NAMES
        // =================================================>
        var SET = (conf.pattern === 'traditional')
            ? 'SET_' + PROP_SUBPROP.toUpperCase()
            : PROP_SUBPROP;
        var DELETE = (conf.pattern === 'traditional')
            ? 'DELETE_' + PROP_SUBPROP.toUpperCase()
            : '-' + PROP_SUBPROP;
        // =================================================>
        //   PROP MUTATION
        // =================================================>
        // All good, make the mutation!
        if (!PROP_SUBPROP.includes('*')) {
            mutations[SET] = function (state, payload) { return SET_PROP_SUBPROP(state, payload, PROP_SUBPROP); };
            mutations[DELETE] = function (state) { return DELETE_PROP_SUBPROP(state, PROP_SUBPROP); };
        }
        else if (prop !== '*') {
            // path includes wildcard, but prop is not a wildcard
            mutations[SET] = function (state, payload) { return MUTATE_PROP_x_SUBPROP(state, payload, PROP_SUBPROP, conf); };
            mutations[DELETE] = function (state, payload) { return DELETE_PROP_x_SUBPROP(state, payload, PROP_SUBPROP, conf); };
        }
        // =================================================>
        //   WILDCARD MUTATION
        // =================================================>
        if (prop === '*') {
            mutations[SET] = function (state, payload) { return MUTATE_PROP_x(state, payload, PROP_SUBPROP, conf, propValue); };
            mutations[DELETE] = function (state, payload) { return DELETE_PROP_x(state, payload, PROP_SUBPROP, conf); };
        }
        // =================================================>
        //   ARRAY MUTATIONS
        // =================================================>
        if (isWhat.isArray(propValue)) {
            // PUSH mutation name
            var push = (conf.pattern === 'traditional')
                ? 'PUSH_' + PROP_SUBPROP.toUpperCase()
                : PROP_SUBPROP + '.push';
            mutations[push] = function (state, payload) {
                return executeArrayMutation(state, payload, 'push', PROP_SUBPROP, conf);
            };
            // POP mutation name
            var pop = (conf.pattern === 'traditional')
                ? 'POP_' + PROP_SUBPROP.toUpperCase()
                : PROP_SUBPROP + '.pop';
            mutations[pop] = function (state, payload) {
                return executeArrayMutation(state, payload, 'pop', PROP_SUBPROP, conf);
            };
            // SHIFT mutation name
            var shift = (conf.pattern === 'traditional')
                ? 'SHIFT_' + PROP_SUBPROP.toUpperCase()
                : PROP_SUBPROP + '.shift';
            mutations[shift] = function (state, payload) {
                return executeArrayMutation(state, payload, 'shift', PROP_SUBPROP, conf);
            };
            // SPLICE mutation name
            var splice = (conf.pattern === 'traditional')
                ? 'SPLICE_' + PROP_SUBPROP.toUpperCase()
                : PROP_SUBPROP + '.splice';
            mutations[splice] = function (state, payload) {
                return executeArrayMutation(state, payload, 'splice', PROP_SUBPROP, conf);
            };
        }
        // =================================================>
        //   CHILDREN MUTATIONS
        // =================================================>
        if (isWhat.isObject(propValue) && Object.keys(propValue).length) {
            var childrenMutations = makeMutationsForAllProps(propValue, PROP_SUBPROP, conf, infoNS);
            Object.assign(mutations, childrenMutations);
        }
        return mutations;
    }, {});
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
function defaultMutations(initialState, userConf, infoNS) {
    if (userConf === void 0) { userConf = {}; }
    var mergedConf = Object.assign({}, defaultConfig, userConf);
    return makeMutationsForAllProps(initialState, null, mergedConf, infoNS);
}

/**
 * Creates a getter function in the store to set any state value.
 * Usage:
 * `get('module/path/path.to.prop')`
 * it will check first for existence of: `getters['module/path/path.to.prop']`
 * if non existant it will return: `state.module.path.path.to.prop`
 * Import method:
 * `store.get = (path) => { return defaultGetter(path, store) }`
 *
 * @param {string} path the path of the prop to get eg. 'info/user/favColours.primary'
 * @param {IInitialisedStore} store the store to attach
 * @returns {*} getter or state
 */
function defaultGetter(path, store) {
    var getterExists = store.getters.hasOwnProperty(path);
    if (getterExists)
        return store.getters[path];
    return getDeepValue(store.state, path);
}

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
function defaultSetter(path, payload, store, conf) {
    if (conf === void 0) { conf = {}; }
    var _a = formatSetter(path, payload, store, conf), command = _a.command, _path = _a._path, _payload = _a._payload;
    if (command === 'error')
        return _payload;
    return store[command](_path, _payload);
}
function formatSetter(path, payload, store, conf) {
    if (conf === void 0) { conf = {}; }
    var dConf = Object.assign({}, defaultConfig, conf);
    var pArr = path.split('/'); // ['info', 'user', 'favColours.primary']
    var props = pArr.pop(); // 'favColours.primary'
    var modulePath = (pArr.length)
        ? pArr.join('/') + '/' // 'info/user/'
        : '';
    var setProp = (dConf.pattern === 'traditional')
        ? 'set' + props[0].toUpperCase() + props.substring(1) // 'setFavColours.primary'
        : props; // 'favColours.primary'
    // Check if an action exists, if it does, trigger that and return early!
    var moduleSetProp = modulePath + setProp;
    var actionExists = store._actions[moduleSetProp];
    if (actionExists) {
        return { command: 'dispatch', _path: moduleSetProp, _payload: payload };
    }
    // [vuex-easy-firestore] check if it's a firestore module
    var fsModulePath = (!modulePath && props && !props.includes('.') && dConf.vuexEasyFirestore)
        ? props + '/'
        : modulePath;
    var _module = store._modulesNamespaceMap[fsModulePath];
    var fsConf = (!_module) ? null : _module.state._conf;
    if (dConf.vuexEasyFirestore && fsConf) {
        // 'info/user/set', {favColours: {primary: payload}}'
        var firestoreActionPath = fsModulePath + 'set';
        var firestoreActionExists = store._actions[firestoreActionPath];
        if (firestoreActionExists) {
            var fsPropName = fsConf.statePropName;
            var fsProps = (fsPropName && props.startsWith(fsPropName + "."))
                ? props.replace(fsPropName + ".", '')
                : props;
            var newPayload = (!fsProps || (!modulePath && fsProps && !fsProps.includes('.')))
                ? payload
                : createObjectFromPath(fsProps, payload, _module.state, dConf);
            return { command: 'dispatch', _path: firestoreActionPath, _payload: newPayload };
        }
    }
    // Trigger the mutation!
    var SET_PROP = (dConf.pattern === 'traditional')
        ? 'SET_' + props.toUpperCase() // 'SET_FAVCOLOURS.PRIMARY'
        : props; // 'favColours.primary'
    var MODULES_SET_PROP = modulePath + SET_PROP;
    var mutationExists = store._mutations[MODULES_SET_PROP];
    if (mutationExists) {
        return { command: 'commit', _path: MODULES_SET_PROP, _payload: payload };
    }
    var triggeredError = error('missingSetterMutation', dConf, MODULES_SET_PROP, props);
    return { command: 'error', _payload: triggeredError };
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
function defaultDeletor(path, payload, store, conf) {
    if (conf === void 0) { conf = {}; }
    var _a = formatDeletor(path, payload, store, conf), command = _a.command, _path = _a._path, _payload = _a._payload;
    if (command === 'error')
        return _payload;
    return store[command](_path, _payload);
}
function formatDeletor(path, payload, store, conf) {
    if (conf === void 0) { conf = {}; }
    var dConf = Object.assign({}, defaultConfig, conf); // 'user/items.*.tags.*'
    var pArr = path.split('/'); // ['user', 'items.*.tags.*']
    var props = pArr.pop(); // 'items.*.tags.*'
    var modulePath = (pArr.length)
        ? pArr.join('/') + '/' // 'user/'
        : '';
    var deleteProp = (dConf.pattern === 'traditional')
        ? 'delete' + props[0].toUpperCase() + props.substring(1) // 'deleteItems.*.tags.*'
        : '-' + props; // '-items.*.tags.*'
    // Check if an action exists, if it does, trigger that and return early!
    var moduleDeleteProp = modulePath + deleteProp;
    var actionExists = store._actions[moduleDeleteProp];
    if (actionExists) {
        return { command: 'dispatch', _path: moduleDeleteProp, _payload: payload };
    }
    // [vuex-easy-firestore] check if it's a firestore module
    var _module = store._modulesNamespaceMap[modulePath];
    var fsConf = (!_module) ? null : _module.state._conf;
    if (dConf.vuexEasyFirestore && fsConf) {
        // DOC: 'user/favColours.*', 'primary'
        // COLLECTION: 'items.*', '123'
        // COLLECTION: 'items.*.tags.*', ['123', 'dark']
        var fsPropName = fsConf.statePropName;
        var fsProps = (fsPropName && props.startsWith(fsPropName + "."))
            ? props.replace(fsPropName + ".", '')
            : props;
        var newPath = fsProps;
        if (fsProps.includes('*')) {
            var idsPayload = (!isWhat.isArray(payload)) ? [payload] : payload;
            var ids = getIdsFromPayload(idsPayload);
            newPath = fillinPathWildcards(ids, fsProps, _module.state, conf);
        }
        if (newPath)
            return { command: 'dispatch', _path: modulePath + 'delete', _payload: newPath };
    }
    // Trigger the mutation!
    var DELETE_PROP = (dConf.pattern === 'traditional')
        ? 'DELETE_' + props.toUpperCase() // 'DELETE_ITEMS.*.TAGS.*'
        : '-' + props; // '-items.*.tags.*'
    var MODULE_DELETE_PROP = modulePath + DELETE_PROP;
    var mutationExists = store._mutations[MODULE_DELETE_PROP];
    if (mutationExists) {
        return { command: 'commit', _path: MODULE_DELETE_PROP, _payload: payload };
    }
    var triggeredError = error('missingDeleteMutation', dConf, MODULE_DELETE_PROP, props);
    return { command: 'error', _payload: triggeredError };
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
function createSetterModule(targetState, moduleNS, store, conf) {
    if (moduleNS === void 0) { moduleNS = ''; }
    function getSetters(_targetState, _propPath) {
        if (_propPath === void 0) { _propPath = ''; }
        return Object.keys(_targetState).reduce(function (carry, stateProp) {
            // Get the path info up until this point
            var PROP_SUBPROP = (_propPath)
                ? _propPath + '.' + stateProp
                : stateProp;
            var MODULE_PROP_SUBPROP = moduleNS + PROP_SUBPROP;
            // Avoid making setters for private props
            if (conf.ignorePrivateProps && stateProp[0] === '_')
                return carry;
            if (conf.ignoreProps.includes(MODULE_PROP_SUBPROP))
                return carry;
            // Avoid making setters for props which are an entire module on its own
            if (store._modulesNamespaceMap[MODULE_PROP_SUBPROP + '/'])
                return carry;
            // =================================================>
            //   NORMAL SETTER
            // =================================================>
            // All good, make the action!
            carry[PROP_SUBPROP] = function (context, payload) {
                return defaultSetter(MODULE_PROP_SUBPROP, payload, store, conf);
            };
            // Get the value of the prop
            var propValue = _targetState[stateProp];
            // =================================================>
            //   ARRAY SETTERS
            // =================================================>
            if (isWhat.isArray(propValue)) {
                carry[PROP_SUBPROP + '.push'] = function (context, payload) {
                    return defaultSetter(MODULE_PROP_SUBPROP + '.push', payload, store, conf);
                };
                carry[PROP_SUBPROP + '.pop'] = function (context, payload) {
                    return defaultSetter(MODULE_PROP_SUBPROP + '.pop', payload, store, conf);
                };
                carry[PROP_SUBPROP + '.shift'] = function (context, payload) {
                    return defaultSetter(MODULE_PROP_SUBPROP + '.shift', payload, store, conf);
                };
                carry[PROP_SUBPROP + '.splice'] = function (context, payload) {
                    return defaultSetter(MODULE_PROP_SUBPROP + '.splice', payload, store, conf);
                };
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
            if (isWhat.isObject(propValue) && Object.keys(propValue).length) {
                var childrenSetters = getSetters(propValue, PROP_SUBPROP);
                Object.assign(carry, childrenSetters);
            }
            return carry;
        }, {});
    }
    var setters = getSetters(targetState);
    return { actions: setters, namespaced: true };
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
function createDeleteModule(targetState, moduleNS, store, conf) {
    if (moduleNS === void 0) { moduleNS = ''; }
    function getDeletors(_targetState, _propPath) {
        if (_propPath === void 0) { _propPath = ''; }
        return Object.keys(_targetState).reduce(function (carry, stateProp) {
            // Get the path info up until this point
            var PROP_SUBPROP = (_propPath)
                ? _propPath + '.' + stateProp
                : stateProp;
            var MODULE_PROP_SUBPROP = moduleNS + PROP_SUBPROP;
            // Avoid making deletor for private props
            if (conf.ignorePrivateProps && stateProp[0] === '_')
                return carry;
            if (conf.ignoreProps.includes(MODULE_PROP_SUBPROP))
                return carry;
            // Avoid making deletor for props which are an entire module on its own
            if (store._modulesNamespaceMap[MODULE_PROP_SUBPROP + '/'])
                return carry;
            // Get the value of the prop
            var propValue = _targetState[stateProp];
            carry[PROP_SUBPROP] = function (context, payload) {
                return defaultDeletor(MODULE_PROP_SUBPROP, payload, store, conf);
            };
            // let's do it's children as well!
            if (isWhat.isObject(propValue) && Object.keys(propValue).length) {
                var childrenDeletors = getDeletors(propValue, PROP_SUBPROP);
                Object.assign(carry, childrenDeletors);
            }
            return carry;
        }, {});
    }
    var deletors = getDeletors(targetState);
    return { actions: deletors, namespaced: true };
}
/**
 * Generate all vuex-easy-access modules: `/set/` and `/delete/` for each module
 *
 * @export
 * @param {IInitialisedStore} store
 * @param {IDefaultConfig} [conf={}]
 */
function generateSetterModules(store, conf) {
    if (conf === void 0) { conf = {}; }
    var modules = store._modulesNamespaceMap;
    var dConf = Object.assign({}, defaultConfig, conf);
    Object.keys(modules).forEach(function (moduleNS) {
        var _module = modules[moduleNS];
        var moduleName = getKeysFromPath(moduleNS + dConf.setter);
        var setterModule = createSetterModule(_module.state, moduleNS, store, dConf);
        store.registerModule(moduleName, setterModule);
        var deleteModule = createDeleteModule(_module.state, moduleNS, store, dConf);
        var deleteModuleName = getKeysFromPath(moduleNS + dConf.deletor);
        store.registerModule(deleteModuleName, deleteModule);
    });
    var rootModuleName = dConf.setter;
    var rootSetterModule = createSetterModule(store.state, '', store, dConf);
    store.registerModule(rootModuleName, rootSetterModule);
    var rootDeleteModuleName = dConf.deletor;
    var rootDeleteModule = createDeleteModule(store.state, '', store, dConf);
    store.registerModule(rootDeleteModuleName, rootDeleteModule);
}

/**
 * Vuex Easy Access plugin
 * Unified syntax with simple set() and get() store access + auto generate mutations!
 *
 * @author     Luca Ban
 * @contact    https://lucaban.com
 */
/**
 * This will create the `/set/` sub-modules and add `set()` `get()` and `delete()` to the store object.
 *
 * @param {IDefaultConfig} [userConfig={}]
 * @returns {*} the store object
 */
function createEasyAccess(userConfig) {
    if (userConfig === void 0) { userConfig = {}; }
    var conf = Object.assign({}, defaultConfig, userConfig);
    return function (store) {
        generateSetterModules(store, conf);
        store[conf.setter] = function (path, payload) { return defaultSetter(path, payload, store, conf); };
        store[conf.getter] = function (path) { return defaultGetter(path, store); };
        store[conf.deletor] = function (path, payload) { return defaultDeletor(path, payload, store, conf); };
    };
}

exports.default = createEasyAccess;
exports.createEasyAccess = createEasyAccess;
exports.defaultMutations = defaultMutations;
exports.defaultGetter = defaultGetter;
exports.defaultSetter = defaultSetter;
exports.defaultDeletor = defaultDeletor;
exports.getDeepRef = getDeepRef;
exports.getKeysFromPath = getKeysFromPath;
