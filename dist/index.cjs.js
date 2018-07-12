'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isWhat = require('is-what');

var defaultConf = {
  setter: 'set',
  getter: 'get',
  vuexEasyFirestore: false,
  ignorePrivateProps: true,
  ignoreProps: [],
  pattern: 'standard'
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
 * @returns {object} the property which was requested
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
 * Pops a value of an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to set the value on
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
 * Pushes a value in an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to set the value on
 * @param   {string} path     'path/to.sub.prop'
 * @param   {*}      value    the value to set
 *
 * @returns {number}          the new length of the array
 */
function pushDeepValue(target, path, value) {
  var deepRef = getDeepRef(target, path);
  if (!isWhat.isArray(deepRef)) return;
  return deepRef.push(value);
}

/**
 * Splice into an array which is a deep property in an object, based on a path to that property
 *
 * @param   {object} target       the Object to set the value on
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

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

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

  conf = Object.assign({}, defaultConf, conf);
  if (!isWhat.isObject(propParent)) return {};
  return Object.keys(propParent).reduce(function (mutations, prop) {
    // Get the path info up until this point
    var propPath = !path ? prop : path + '.' + prop;
    // mutation name
    var name = conf.pattern === 'simple' ? propPath : 'SET_' + propPath.toUpperCase();
    // Avoid making setters for private props
    if (conf.ignorePrivateProps && prop[0] === '_') return mutations;
    if (conf.ignoreProps
    // replace 'module/submodule/prop.subprop' with 'prop.subprop'
    // because: moduleNS is not knowns when this is called
    .map(function (p) {
      return p.replace(/(.*?)\/([^\/]*?)$/, '$2');
    }).includes(propPath)) {
      return mutations;
    }
    // All good, make the action!
    mutations[name] = function (state, newVal) {
      return setDeepValue(state, propPath, newVal);
    };
    // BTW, check if the value of this prop was an object, if so, let's do it's children as well!
    var propValue = propParent[prop];
    if (isWhat.isObject(propValue)) {
      var childrenMutations = makeMutationsForAllProps(propValue, propPath, conf);
      mutations = _extends({}, mutations, childrenMutations);
    }
    // If the prop is an array, make array mutations as well
    if (isWhat.isArray(propValue)) {
      // mutation name
      var pop = conf.pattern === 'simple' ? propPath + '.pop' : 'POP_' + propPath.toUpperCase();
      mutations[pop] = function (state) {
        return popDeepValue(state, propPath);
      };
      // mutation name
      var push = conf.pattern === 'simple' ? propPath + '.push' : 'PUSH_' + propPath.toUpperCase();
      mutations[push] = function (state, value) {
        return pushDeepValue(state, propPath, value);
      };
      // mutation name
      var splice = conf.pattern === 'simple' ? propPath + '.splice' : 'SPLICE_' + propPath.toUpperCase();
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

  conf = Object.assign({}, defaultConf, conf);
  return makeMutationsForAllProps(initialState, null, conf);
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
 * it will check first for existence of: `dispatch('module/path/setPath.to.prop')`
 * if non existant it will execute: `commit('module/path/SET_PATH.TO.PROP', newValue)`
 * Import method:
 * `store.set = (path, payload) => { return defaultSetter(path, payload, store) }`
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

  conf = Object.assign({}, defaultConf, conf);
  // path = 'info/user/favColours.primary'
  var pArr = path.split('/');
  // ['info', 'user', 'favColours.primary']
  var props = pArr.pop();
  // props = 'favColours.primary'
  var modulePath = pArr.length ? pArr.join('/') + '/' : '';
  // 'info/user/'
  var actionName = conf.pattern === 'simple' ? props : 'set' + props[0].toUpperCase() + props.substring(1);
  // 'favColours.primary' or 'setFavColours.primary'
  var actionPath = modulePath + actionName;
  // 'info/user/setFavColours.primary'
  var actionExists = store._actions[actionPath];
  if (actionExists) {
    return store.dispatch(actionPath, payload);
  }
  // vuex-easy-firestore integration!
  var pathIsModule = store._modulesNamespaceMap[path + '/'];
  // only if the full path is actually a module
  if (conf.vuexEasyFirestore && pathIsModule) {
    // 'info/user/set', {favColours: {primary: payload}}'
    var firestoreActionPath = path + '/set';
    var newPayload = payload;
    var firestoreActionExists = store._actions[firestoreActionPath];
    if (firestoreActionExists) {
      return store.dispatch(firestoreActionPath, newPayload);
    }
  }
  var mutationName = conf.pattern === 'simple' ? props : 'SET_' + props.toUpperCase();
  // 'favColours.primary' or 'SET_FAVCOLOURS.PRIMARY'
  var mutationPath = modulePath + mutationName;
  var mutationExists = store._mutations[mutationPath];
  if (mutationExists) {
    return store.commit(mutationPath, payload);
  }
  console.error('There is no mutation set for \'' + mutationPath + '\'.\n    Please add a mutation like so in the correct module:\n\n    mutations: {\n      \'' + mutationName + '\': ({state}, payload) => {\n        state.' + props + ' = payload\n      }\n    }\n\n    You can also add mutations automatically with vuex-easy-access.\n    See the documentation here:\n      https://github.com/mesqueeb/VuexEasyAccess#2-automatically-generate-mutations-for-each-state-property');
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
      // BTW, check if the value of this prop was an object, if so, let's do it's children as well!
      var propVal = _targetState[stateProp];
      if (isWhat.isObject(propVal) && Object.keys(propVal).length) {
        var childrenSetters = getSetters(propVal, propPath);
        Object.assign(carry, childrenSetters);
      }
      return carry;
    }, {});
  }
  var setters = getSetters(targetState);
  return { actions: setters, namespaced: true };
}

// if everything's namespaced _modulesNameSpaceMap will work just fine.
// function getModulesNameSpaceMap (_module, ns = '') {
//   if (!_module || !_module._children) return console.log(_module)
//   return Object.keys(_module._children).reduce((carry, key) => {
//     const childModule = _module._children[key]
//     const moduleNS = ns + key + '/'
//     carry[moduleNS] = childModule
//     const childrensModules = getModulesNameSpaceMap(childModule, moduleNS)
//     Object.assign(carry, childrensModules)
//     return carry
//   }, {})
// }

function generateSetterModules(store, setterIdentifier) {
  var conf = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var modules = store._modulesNamespaceMap;
  Object.keys(modules).forEach(function (moduleNS) {
    var _module = modules[moduleNS];
    var moduleName = getKeysFromPath(moduleNS + setterIdentifier);
    var setterModule = createSetterModule(_module.state, moduleNS, store, conf);
    store.registerModule(moduleName, setterModule);
  });
  conf = Object.assign({}, defaultConf, conf);
  var rootModuleName = setterIdentifier;
  var rootSetterModule = createSetterModule(store.state, '', store, conf);
  store.registerModule(rootModuleName, rootSetterModule);
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
    generateSetterModules(store, conf.setter, conf);
    store[conf.setter] = function (path, payload) {
      return defaultSetter(path, payload, store, conf);
    };
    store[conf.getter] = function (path) {
      return defaultGetter(path, store);
    };
  };
}

exports.default = createEasyAccess;
exports.createEasyAccess = createEasyAccess;
exports.defaultMutations = defaultMutations;
exports.defaultSetter = defaultSetter;
exports.defaultGetter = defaultGetter;
exports.getDeepRef = getDeepRef;
exports.getKeysFromPath = getKeysFromPath;
