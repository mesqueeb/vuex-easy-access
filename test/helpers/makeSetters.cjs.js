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
 *
 * @param   {string} path     'a/path/like.this'
 * @param   {*}      payload
 * @param   {object} [state] the state to check if the value actually exists
 * @param   {object} [conf] (optional - for error handling) the vuex-easy-access config
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
                : createObjectFromPath(fsProps, payload);
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
            newPath = fillinPathWildcards(ids, fsProps);
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

exports.defaultSetter = defaultSetter;
exports.formatSetter = formatSetter;
exports.defaultDeletor = defaultDeletor;
exports.formatDeletor = formatDeletor;
exports.generateSetterModules = generateSetterModules;
