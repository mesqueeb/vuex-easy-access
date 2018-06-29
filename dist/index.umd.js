(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('is-what')) :
  typeof define === 'function' && define.amd ? define(['exports', 'is-what'], factory) :
  (factory((global.VuexEasyAccess = {}),global.isWhat));
}(this, (function (exports,isWhat) { 'use strict';

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

  /**
   * Vuex Easy Access plugin
   * Unified syntax with simple set() and get() store access + auto generate mutations!
   *
   * @author     Luca Ban
   * @contact    https://lucaban.com
   */

  /**
   * Creates the mutations for each property of the object passed recursively
   *
   * @param   {object} propParent an Object of which all props will get a mutation
   * @param   {string} path       the path taken until the current propParent instance
   *
   * @returns {object}            all mutations for each property.
   */
  function makeMutationsForAllProps(propParent, path) {
    if (!isWhat.isObject(propParent)) return {};
    return Object.keys(propParent).reduce(function (mutations, prop) {
      var propPath = !path ? prop : path + '.' + prop;
      var name = 'SET_' + propPath.toUpperCase();
      mutations[name] = function (state, newVal) {
        return setDeepValue(state, propPath, newVal);
      };
      var propValue = propParent[prop];
      // If the prop is an object, make the children setters as well
      if (isWhat.isObject(propValue)) {
        var childrenMutations = makeMutationsForAllProps(propValue, propPath);
        mutations = _extends({}, mutations, childrenMutations);
      }
      // If the prop is an array, make array mutations as well
      if (isWhat.isArray(propValue)) {
        var pop = 'POP_' + propPath.toUpperCase();
        mutations[pop] = function (state) {
          return popDeepValue(state, propPath);
        };
        var push = 'PUSH_' + propPath.toUpperCase();
        mutations[push] = function (state, value) {
          return pushDeepValue(state, propPath, value);
        };
        var splice = 'SPLICE_' + propPath.toUpperCase();
        mutations[splice] = function (state, index, deleteCount, value) {
          return spliceDeepValue(state, propPath, index, deleteCount, value);
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
   * @param   {object} initialState   the initial state of a module
   *
   * @returns {object}                all mutations for the state
   */
  function defaultMutations(initialState) {
    return makeMutationsForAllProps(initialState);
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
   *
   * @returns {function}          dispatch or commit
   */
  function defaultSetter(path, payload, store, vuexEasyFirestore) {
    // path = 'info/user/favColours.primary'
    var pArr = path.split('/');
    // ['info', 'user', 'favColours.primary']
    var props = pArr.pop();
    // 'favColours.primary'
    var modulePath = pArr.length ? pArr.join('/') + '/' : '';
    // 'info/user/'
    var actionName = 'set' + props[0].toUpperCase() + props.substring(1);
    // 'setFavColours.primary'
    var actionPath = modulePath + actionName;
    // 'info/user/setFavColours.primary'
    var actionExists = store._actions[actionPath];
    if (actionExists) {
      return store.dispatch(actionPath, payload);
    }
    if (vuexEasyFirestore) {
      // 'info/user/set', {favColours: {primary: payload}}'
      var pathIsModule = store._modulesNamespaceMap[path + '/'];
      var firestoreActionPath = pathIsModule ? path + '/set' : modulePath + 'set';
      var newPayload = pathIsModule ? payload : {};
      if (!pathIsModule) newPayload[props] = payload;
      var firestoreActionExists = store._actions[firestoreActionPath];
      if (firestoreActionExists) {
        return store.dispatch(firestoreActionPath, newPayload);
      }
    }
    var mutationPath = modulePath + 'SET_' + props.toUpperCase();
    return store.commit(mutationPath, payload);
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

  var defaultConfig = {
    setter: 'set',
    getter: 'get',
    vuexEasyFirestore: false
  };

  /**
   * Vuex Easy Access plugin
   * Unified syntax with simple set() and get() store access + auto generate mutations!
   *
   * @author     Luca Ban
   * @contact    https://lucaban.com
   */

  function createEasyAccess(userConfig) {
    var conf = Object.assign(defaultConfig, userConfig);
    var vuexEasyFirestore = conf.vuexEasyFirestore;
    return function (store) {
      store[conf.setter] = function (path, payload) {
        return defaultSetter(path, payload, store, vuexEasyFirestore);
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

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.umd.js.map
