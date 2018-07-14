'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var isWhat = require('is-what');
var Vue = _interopDefault(require('vue'));

var defaultConf = {
  setter: 'set',
  getter: 'get',
  deletor: 'delete',
  vuexEasyFirestore: false,
  ignorePrivateProps: true,
  ignoreProps: [],
  pattern: 'simple'
};

/**
 * Returns the keys of a path
 *
 * @param   {string} path   a/path/like.this
 * @returns {array} with keys
 */
function getKeysFromPath(path) {
  if (!path) return [];
  return path.match(/\w+/g);
}

/**
 * Gets a deep property in an object, based on a path to that property
 *
 * @param {object} target an object to wherefrom to retrieve the deep reference of
 * @param {string} path   'path/to.prop'
 *
 * @returns {object} the last prop in the path
 */
function getDeepRef() {
  var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var path = arguments[1];

  var keys = getKeysFromPath(path);
  if (!keys.length) return target;
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
 *
 * @returns {object}          the property's value
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
 *
 * @returns {object}          the original target object
 */
function setDeepValue(target, path, value) {
  var keys = getKeysFromPath(path);
  var lastKey = keys.pop();
  var deepRef = getDeepRef(target, keys.join());
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
 *
 * @returns {number}          the new length of the array
 */
function pushDeepValue(target, path, value) {
  var deepRef = getDeepRef(target, path);
  if (!isWhat.isArray(deepRef)) return;
  return deepRef.push(value);
}

/**
 * Pops a value of an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to pop the value of
 * @param   {string} path     'path.to.sub.prop'
 *
 * @returns {*}               the popped value
 */
function popDeepValue(target, path) {
  var deepRef = getDeepRef(target, path);
  if (!isWhat.isArray(deepRef)) return;
  return deepRef.pop();
}

/**
 * Shift a value of an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to shift the value of
 * @param   {string} path     'path.to.sub.prop'
 *
 * @returns {*}               the shifted value
 */
function shiftDeepValue(target, path) {
  var deepRef = getDeepRef(target, path);
  if (!isWhat.isArray(deepRef)) return;
  return deepRef.shift();
}

/**
 * Splice into an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target       the Object to splice the value of
 * @param   {string} path         'path/to.sub.prop'
 * @param   {*}      value        the value to splice in
 * @param   {number} index        the index to splice in the value, defaults to 0
 * @param   {number} deleteCount  the amount of items to delete, defaults to 0
 *
 * @returns {array}              an array containing the deleted elements
 */
function spliceDeepValue(target, path) {
  var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var deleteCount = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var value = arguments[4];

  var deepRef = getDeepRef(target, path);
  if (!isWhat.isArray(deepRef)) return;
  return deepRef.splice(index, deleteCount, value);
}

function error (error) {
  if (error === 'mutationSetterWildcard') {
    console.error('[vuex-easy-access] The payload needs to be an object with an ID field.\n      Correct usage example:\n        commit(\'items/*\', {id: \'123\', name: \'the best item\'})\n    ');
  }
  if (error === 'mutationDeleteWildcard') {
    return console.error('[vuex-easy-access] The payload needs to be an object with an ID field.\n      Correct usage example:\n        commit(\'-items/*\', {id: \'123\'})\n        // or\n        commit(\'-items\', \'123\')\n    ');
  }
}

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * Creates the mutations for each property of the object passed recursively
 *
 * @param   {object} propParent an Object of which all props will get a mutation
 * @param   {string} path       the path taken until the current propParent instance
 * @param   {object} conf       user config
 *
 * @returns {object}            all mutations for each property.
 */
function makeMutationsForAllProps(propParent, path) {
  var conf = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var infoNS = arguments[3];

  conf = Object.assign({}, defaultConf, conf);
  if (!isWhat.isObject(propParent)) return {};
  return Object.keys(propParent).reduce(function (mutations, prop) {
    // Get the path info up until this point
    var propPath = !path ? prop : path + '.' + prop;
    // mutation name
    var name = conf.pattern === 'traditional' ? 'SET_' + propPath.toUpperCase() : propPath;
    // Avoid making setters for private props
    if (conf.ignorePrivateProps && prop[0] === '_') return mutations;
    if (conf.ignoreProps.some(function (ignPropFull) {
      var separatePropFromNS = /(.*?)\/([^\/]*?)$/.exec(ignPropFull);
      var ignPropNS = separatePropFromNS ? separatePropFromNS[1] + '/' : '';
      var ignProp = separatePropFromNS ? separatePropFromNS[2] : ignPropFull;
      return !infoNS && ignProp === propPath || infoNS && infoNS.moduleNamespace == ignPropNS && ignProp === propPath;
    })) {
      return mutations;
    }
    // All good, make the mutation!
    mutations[name] = function (state, newVal) {
      return setDeepValue(state, propPath, newVal);
    };
    // Get the value of the prop
    var propValue = propParent[prop];
    // let's do it's children as well!
    if (isWhat.isObject(propValue) && Object.keys(propValue).length) {
      var childrenMutations = makeMutationsForAllProps(propValue, propPath, conf);
      Object.assign(mutations, childrenMutations);
    }
    // let's create a wildcard & deletion mutations
    if (isWhat.isObject(propValue) && !Object.keys(propValue).length) {
      // wildcard
      mutations[name + '.*'] = function (state, newVal) {
        if (!newVal.id) return error('mutationSetterWildcard');
        var ref = getDeepRef(state, propPath);
        Vue.set(ref, newVal.id, newVal);
      };
      // deletion
      var deleteName = conf.pattern === 'traditional' ? 'DELETE_' + propPath.toUpperCase() : '-' + propPath;
      mutations[deleteName] = function (state, id) {
        if (id) {
          var _ref = getDeepRef(state, propPath);
          return Vue.delete(_ref, id);
        }
        var propArr = propPath.split('.');
        id = propArr.pop();
        if (!propArr.length) {
          return Vue.delete(state, id);
        }
        var ref = getDeepRef(state, propArr.join('.'));
        return Vue.delete(ref, id);
      };
      mutations[deleteName + '.*'] = function (state, _ref2) {
        var id = _ref2.id;

        if (!id) return error('mutationDeleteWildcard');
        var ref = getDeepRef(state, propPath);
        return Vue.delete(ref, id);
      };
    }
    // If the prop is an array, make array mutations as well
    if (isWhat.isArray(propValue)) {
      // PUSH mutation name
      var push = conf.pattern === 'traditional' ? 'PUSH_' + propPath.toUpperCase() : propPath + '.push';
      mutations[push] = function (state, value) {
        return pushDeepValue(state, propPath, value);
      };
      // POP mutation name
      var pop = conf.pattern === 'traditional' ? 'POP_' + propPath.toUpperCase() : propPath + '.pop';
      mutations[pop] = function (state) {
        return popDeepValue(state, propPath);
      };
      // SHIFT mutation name
      var shift = conf.pattern === 'traditional' ? 'SHIFT_' + propPath.toUpperCase() : propPath + '.shift';
      mutations[shift] = function (state, value) {
        return shiftDeepValue(state, propPath, value);
      };
      // SPLICE mutation name
      var splice = conf.pattern === 'traditional' ? 'SPLICE_' + propPath.toUpperCase() : propPath + '.splice';
      mutations[splice] = function (state, array) {
        return spliceDeepValue.apply(undefined, [state, propPath].concat(toConsumableArray(array)));
      };
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
 *   ...defaultMutations (initialState)
 * }
 *
 * @param   {object} initialState  the initial state of a module
 * @param   {object} conf          user config
 *
 * @returns {object}                all mutations for the state
 */
function defaultMutations(initialState) {
  var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var infoNS = arguments[2];

  conf = Object.assign({}, defaultConf, conf);
  return makeMutationsForAllProps(initialState, null, conf, infoNS);
}

/**
 * Creates a getter function in the store to set any state value
 * Usage:
 * `get('module/path/path.to.prop')`
 * it will check first for existence of: `getters['module/path/path.to.prop']`
 * if non existant it will return: `state.module.path.path.to.prop`
 * Import method:
 * `store.get = (path) => { return defaultGetter(path, store) }`
 *
 * @param   {string}   path     the path of the prop to get eg. 'info/user/favColours.primary'
 * @param   {object}   store    the store to attach
 *
 * @returns {function}          getter or state
 */
function defaultGetter(path, store) {
  var getterExists = store.getters.hasOwnProperty(path);
  if (getterExists) return store.getters[path];
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
 * @param   {string}   path     the path of the prop to set eg. 'info/user/favColours.primary'
 * @param   {*}        payload  the payload to set the prop to
 * @param   {object}   store    the store to attach
 * @param   {object}   conf     user config
 *
 * @returns {function}          dispatch or commit
 */
function defaultSetter(path, payload, store) {
  var conf = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  conf = Object.assign({}, defaultConf, conf); // 'info/user/favColours.primary'
  var pArr = path.split('/'); // ['info', 'user', 'favColours.primary']
  var props = pArr.pop(); // 'favColours.primary'
  var modulePath = pArr.length ? pArr.join('/') + '/' // 'info/user/'
  : '';
  var actionName = conf.pattern === 'traditional' ? 'set' + props[0].toUpperCase() + props.substring(1) // 'setFavColours.primary'
  : props; // 'favColours.primary'
  // Check if an action exists, if it does, trigger that and return early!
  var actionPath = modulePath + actionName;
  var actionExists = store._actions[actionPath];
  if (actionExists) {
    return store.dispatch(actionPath, payload);
  }
  // [vuex-easy-firestore] check if it's a firestore module
  var _module = store._modulesNamespaceMap[modulePath];
  var firestoreConf = !_module ? null : _module.state._conf;
  if (conf.vuexEasyFirestore && firestoreConf) {
    // 'info/user/set', {favColours: {primary: payload}}'
    var newPayload = {};
    // if (!props) trigger easy-firestore 'set' with the payload
    if (!props) newPayload = payload;
    // if (props) re-nest the props as part of the payload:
    // eg. ('/sub.prop', payload) becomes →  {sub: {prop: payload}}
    if (props) {
      props.split('.').reduce(function (carry, _prop, index, array) {
        var container = index === array.length - 1 ? payload : {};
        if (_prop === '*' && payload.id) _prop = payload.id;
        carry[_prop] = container;
        return container;
      }, newPayload);
    }
    var firestoreActionPath = modulePath + 'set';
    var firestoreActionExists = store._actions[firestoreActionPath];
    if (firestoreActionExists) {
      return store.dispatch(firestoreActionPath, newPayload);
    }
  }
  // Trigger the mutation!
  var mutationName = conf.pattern === 'traditional' ? 'SET_' + props.toUpperCase() // 'SET_FAVCOLOURS.PRIMARY'
  : props; // 'favColours.primary'
  var mutationPath = modulePath + mutationName;
  var mutationExists = store._mutations[mutationPath];
  if (mutationExists) {
    return store.commit(mutationPath, payload);
  }
  console.error('[vuex-easy-access] There is no mutation set for \'' + mutationPath + '\'.\n    Please add a mutation like so in the correct module:\n\n    mutations: {\n      \'' + mutationName + '\': (state, payload) => {\n        state.' + props + ' = payload\n      }\n    }\n\n    You can also add mutations automatically with vuex-easy-access.\n    See the documentation here:\n      https://github.com/mesqueeb/VuexEasyAccess#2-automatically-generate-mutations-for-each-state-property');
}

/**
 * Creates a delete function in the store to delete any prop from a value
 * Usage:
 * `delete('module/path/path.to.prop')` will delete prop
 * `delete('module/path/path.to.prop', id)` will delete prop[id]
 * `delete('module/path/path.to.prop.*', {id})` will delete prop[id]
 * it will check first for existence of: `dispatch('module/path/-path.to.prop')` or `dispatch('module/path/-path.to.prop.*')`
 * if non existant it will execute: `commit('module/path/-path.to.prop')` or `commit('module/path/-path.to.prop.*')`
 * Import method:
 * `store.delete = (path, payload) => { return defaultDeletor(path, payload, store, conf) }`
 *
 * @param   {string}   path     the path of the prop to delete eg. 'info/user/favColours.primary'
 * @param   {*}        payload  either nothing or an id or {id}
 * @param   {object}   store    the store to attach
 * @param   {object}   conf     user config
 *
 * @returns {function}          dispatch or commit
 */
function defaultDeletor(path, payload, store) {
  var conf = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  conf = Object.assign({}, defaultConf, conf); // 'info/user/favColours.primary'
  var pArr = path.split('/'); // ['info', 'user', 'favColours.primary']
  var props = pArr.pop(); // 'favColours.primary'
  var modulePath = pArr.length ? pArr.join('/') + '/' // 'info/user/'
  : '';
  var actionName = conf.pattern === 'traditional' ? 'delete' + props[0].toUpperCase() + props.substring(1) // 'deleteFavColours.primary'
  : '-' + props; // '-favColours.primary'
  // Check if an action exists, if it does, trigger that and return early!
  var actionPath = modulePath + actionName;
  var actionExists = store._actions[actionPath];
  if (actionExists) {
    return store.dispatch(actionPath, payload);
  }
  // [vuex-easy-firestore] check if it's a firestore module
  var _module = store._modulesNamespaceMap[modulePath];
  var firestoreConf = !_module ? null : _module.state._conf;
  if (conf.vuexEasyFirestore && firestoreConf) ;
  // 'info/user/delete', {favColours: {primary: payload}}'
  // 'info/user/delete.favColours.primary', payload'

  // Trigger the mutation!
  var mutationName = conf.pattern === 'traditional' ? 'DELETE_' + props.toUpperCase() // 'DELETE_FAVCOLOURS.PRIMARY'
  : '-' + props; // '-favColours.primary'
  var mutationPath = modulePath + mutationName;
  var mutationExists = store._mutations[mutationPath];
  if (mutationExists) {
    return store.commit(mutationPath, payload);
  }
  console.error('[vuex-easy-access] There is no mutation set for \'' + mutationPath + '\'.\n    Please add a mutation like so in the correct module:\n\n    mutations: {\n      \'' + mutationName + '\': (state, payload) => {\n        this._vm.$delete(state.' + props + ')\n      }\n    }\n\n    You can also add mutations automatically with vuex-easy-access.\n    See the documentation here:\n      https://github.com/mesqueeb/VuexEasyAccess#2-automatically-generate-mutations-for-each-state-property');
}

/**
 * Creates a special 'setter-module' to be registered as a child of a module. This 'setter-module' will have the 'set' namespace (by default) and have one setter action per state prop in the parent module. The setter action's name will be the state prop name.
 *
 * @param {object} targetState   parent module's state object
 * @param {string} [moduleNS=''] parent module's namespace, must end in '/'
 * @param {object} store         vuex store
 * @param {object} conf          user config
 * @returns a special 'setter-module' to be registered as child of target module.
 */
function createSetterModule(targetState) {
  var moduleNS = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var store = arguments[2];
  var conf = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  conf = Object.assign({}, defaultConf, conf);
  function getSetters(_targetState) {
    var _propPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    return Object.keys(_targetState).reduce(function (carry, stateProp) {
      // Get the path info up until this point
      var propPath = _propPath ? _propPath + '.' + stateProp : stateProp;
      var fullPath = moduleNS + propPath;
      // Avoid making setters for private props
      if (conf.ignorePrivateProps && stateProp[0] === '_') return carry;
      if (conf.ignoreProps.includes(fullPath)) return carry;
      // Avoid making setters for props which are an entire module on its own
      if (store._modulesNamespaceMap[fullPath + '/']) return carry;
      // All good, make the action!
      carry[propPath] = function (context, payload) {
        return defaultSetter(fullPath, payload, store, conf);
      };
      // Get the value of the prop
      var propValue = _targetState[stateProp];
      // let's do it's children as well!
      if (isWhat.isObject(propValue) && Object.keys(propValue).length) {
        var childrenSetters = getSetters(propValue, propPath);
        Object.assign(carry, childrenSetters);
      }
      // let's create a wildcard setter
      if (isWhat.isObject(propValue) && !Object.keys(propValue).length) {
        carry[propPath + '.*'] = function (context, payload) {
          return defaultSetter(fullPath + '.*', payload, store, conf);
        };
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
 * @param {object} targetState   parent module's state object
 * @param {string} [moduleNS=''] parent module's namespace, must end in '/'
 * @param {object} store         vuex store
 * @param {object} conf          user config
 * @returns a special 'delete-module' to be registered as child of target module.
 */
function createDeleteModule(targetState) {
  var moduleNS = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var store = arguments[2];
  var conf = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  conf = Object.assign({}, defaultConf, conf);
  function getDeletors(_targetState) {
    var _propPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    return Object.keys(_targetState).reduce(function (carry, stateProp) {
      // Get the path info up until this point
      var propPath = _propPath ? _propPath + '.' + stateProp : stateProp;
      var fullPath = moduleNS + propPath;
      // Avoid making setters for private props
      if (conf.ignorePrivateProps && stateProp[0] === '_') return carry;
      if (conf.ignoreProps.includes(fullPath)) return carry;
      // Avoid making setters for props which are an entire module on its own
      if (store._modulesNamespaceMap[fullPath + '/']) return carry;
      // All good, make the action!
      carry[propPath] = function (context, payload) {
        return defaultDeletor(fullPath, payload, store, conf);
      };
      // Get the value of the prop
      var propValue = _targetState[stateProp];
      // let's do it's children as well!
      if (isWhat.isObject(propValue) && Object.keys(propValue).length) {
        var childrenSetters = getDeletors(propValue, propPath);
        Object.assign(carry, childrenSetters);
      }
      // let's create a wildcard setter
      if (isWhat.isObject(propValue) && !Object.keys(propValue).length) {
        carry[propPath + '.*'] = function (context, payload) {
          return defaultDeletor(fullPath + '.*', payload, store, conf);
        };
      }
      return carry;
    }, {});
  }
  var deletors = getDeletors(targetState);
  return { actions: deletors, namespaced: true };
}

function generateSetterModules(store) {
  var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var modules = store._modulesNamespaceMap;
  conf = Object.assign({}, defaultConf, conf);
  Object.keys(modules).forEach(function (moduleNS) {
    var _module = modules[moduleNS];
    var moduleName = getKeysFromPath(moduleNS + conf.setter);
    var setterModule = createSetterModule(_module.state, moduleNS, store, conf);
    store.registerModule(moduleName, setterModule);
    var deleteModule = createDeleteModule(_module.state, moduleNS, store, conf);
    var deleteModuleName = getKeysFromPath(moduleNS + conf.deletor);
    store.registerModule(deleteModuleName, deleteModule);
  });
  var rootModuleName = conf.setter;
  var rootSetterModule = createSetterModule(store.state, '', store, conf);
  store.registerModule(rootModuleName, rootSetterModule);
  var rootDeleteModuleName = conf.deletor;
  var rootDeleteModule = createDeleteModule(store.state, '', store, conf);
  store.registerModule(rootDeleteModuleName, rootDeleteModule);
}

/**
 * Vuex Easy Access plugin
 * Unified syntax with simple set() and get() store access + auto generate mutations!
 *
 * @author     Luca Ban
 * @contact    https://lucaban.com
 */

function createEasyAccess(userConfig) {
  var conf = Object.assign({}, defaultConf, userConfig);
  return function (store) {
    generateSetterModules(store, conf);
    store[conf.setter] = function (path, payload) {
      return defaultSetter(path, payload, store, conf);
    };
    store[conf.getter] = function (path) {
      return defaultGetter(path, store);
    };
    store[conf.deletor] = function (path, payload) {
      return defaultDeletor(path, payload, store, conf);
    };
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
