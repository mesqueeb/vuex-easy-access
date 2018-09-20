import { isArray, isString, isObject } from 'is-what';
import Vue from 'vue';
import merge from 'merge-anything';

var defaultConfig = {
  setter: 'set',
  getter: 'get',
  deletor: 'delete',
  vuexEasyFirestore: false,
  ignorePrivateProps: true,
  ignoreProps: [],
  pattern: 'simple'
};

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

/* eslint-disable */

function getErrors(conf, path, props) {
  var originInfo = path || props ? "problem with prop: `".concat(props, "` at path: `").concat(path, "`") : '';
  var tradPatt = conf.pattern === 'traditional';
  var setter = conf.setter;
  var deletor = conf.deletor;
  var prop = 'items';
  var mutationNameSet = tradPatt ? 'SET_' + prop.toUpperCase() : prop;
  var mutationNameDel = tradPatt ? 'DELETE_' + prop.toUpperCase() : prop;
  var exampleSetters__Wildcard = "\n    Correct usage examples:\n    // From Vue-components:\n    ".concat(setter, "('").concat(prop, ".*', {'123': {name: 'the best item'}})\n\n    // From the Vuex store:\n    dispatch('").concat(setter, "/").concat(prop, ".*', {'123': {name: 'the best item'}})\n    // or\n    commit('").concat(mutationNameSet, ".*', {'123': {name: 'the best item'}})");
  var exampleSetters__DoubleWildcard = "\n    Correct usage examples:\n    // From Vue-components:\n    ".concat(setter, "('").concat(prop, ".*.tags.*', ['123', {water: true}])\n\n    // From the Vuex store:\n    dispatch('").concat(setter, "/").concat(prop, ".*.tags.*', ['123', {water: true}])\n    // or\n    commit('").concat(mutationNameSet, ".*.tags.*', ['123', {water: true}])");
  var exampleDeletor = "\n    Correct usage examples:\n    // From Vue-components:\n    ".concat(deletor, "('").concat(prop, ".*', '123')\n\n    // From the Vuex store:\n    dispatch('").concat(deletor, "/").concat(prop, ".*', '123')\n    // or\n    commit('").concat(mutationNameDel, ".*', '123')");
  return {
    mutationSetterNoId: "".concat(originInfo, "\n      The payload needs to be an object with an `id` field.\n      ").concat(exampleSetters__Wildcard),
    mutationSetterPropPathWildcardMissingItemDoesntExist: "".concat(originInfo, "\n      The item does not exist! Make sure you first set the item.\n      ").concat(exampleSetters__Wildcard),
    mutationSetterPropPathWildcardIdCount: "".concat(originInfo, "\n      The amount of ids and wildcards `'*'` are not equal.\n      If you have multiple wildcards you need to pass an array, where each item is an ID and the last is the property you want to set.\n      ").concat(exampleSetters__DoubleWildcard, "\n      "),
    mutationDeleteNoId: "".concat(originInfo, "\n      The payload needs to be an object with an `id` field.\n      ").concat(exampleDeletor, "\n      "),
    wildcardFormatWrong: "".concat(originInfo, "\n      There was something wrong with the payload passed when using a path with wildcards.\n\n      A) Path with wildcard:\n      ").concat(exampleSetters__Wildcard, "\n\n      B) Path with multiple wildcards:\n      ").concat(exampleSetters__DoubleWildcard, "\n    "),
    missingDeleteMutation: "\n      There is no mutation set for '".concat(path, "'.\n      Something went wrong with your vuex-easy-access setup.\n      Did you manually add `...defaultMutations(state)` to your modules?\n      See the documentation here:\n        https://github.com/mesqueeb/VuexEasyAccess#setup\n\n\n      // You can also manually add a mutation like so in the correct module (not recommended!!):\n      mutations: {\n        '").concat(tradPatt ? 'DELETE_' + props.toUpperCase() : '-' + props, "': (state, payload) => {\n          this._vm.$delete(state.").concat(props, ")\n        }\n      }\n    "),
    missingSetterMutation: "\n      There is no mutation set for '".concat(path, "'.\n      Something went wrong with your vuex-easy-access setup.\n      Did you manually add `...defaultMutations(state)` to your modules?\n      See the documentation here:\n        https://github.com/mesqueeb/VuexEasyAccess#setup\n\n\n      // You can also manually add a mutation like so in the correct module (not recommended!!):\n      mutations: {\n        '").concat(tradPatt ? 'SET_' + props.toUpperCase() : props, "': (state, payload) => {\n          state.").concat(props, " = payload\n        }\n      }\n    ")
  };
}
/**
 * Error logging
 *
 * @export
 * @param {string} error the error code
 * @param {object} conf the user config
 * @param {string} path (optional) the path the error occured in
 * @param {string} props (optional) the props the error occured with
 * @returns {string} the error code
 */


function error (error) {
  var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var path = arguments.length > 2 ? arguments[2] : undefined;
  var props = arguments.length > 3 ? arguments[3] : undefined;
  conf = Object.assign({}, defaultConfig, conf);
  var errorMessages = getErrors(conf, path, props);
  console.error('[vuex-easy-access] Error!', errorMessages[error]);
  return error;
}

/**
 * gets an ID from a single piece of payload.
 *
 * @param {object, string} payload
 * @param {object} conf (optional - for error handling) the vuex-easy-access config
 * @param {string} path (optional - for error handling) the path called
 * @param {array|object|string} fullPayload (optional - for error handling) the full payload on which each was `getId()` called
 * @returns {string} the id
 */

function getId(payloadPiece, conf, path, fullPayload) {
  if (isObject(payloadPiece)) {
    if (payloadPiece.id) return payloadPiece.id;
    if (Object.keys(payloadPiece).length === 1) return Object.keys(payloadPiece)[0];
  }

  if (isString(payloadPiece)) return payloadPiece;
  error('wildcardFormatWrong', conf, path, payloadPiece);
  return false;
}
/**
 * Get all ids from an array payload.
 *
 * @param {array[string]} payload
 * @param {object} conf (optional - for error handling) the vuex-easy-access config
 * @param {string} path (optional - for error handling) the path called
 * @returns {array[string]} all ids
 */


function getIdsFromPayload(payload, conf, path) {
  return payload.map(function (payloadPiece) {
    return getId(payloadPiece, conf, path, payload);
  });
}
/**
 * Returns a value of a payload piece. Eg. {[id]: 'val'} will return 'val'
 *
 * @param {*} payloadPiece
 * @returns {*} the value
 */

function getValueFromPayloadPiece(payloadPiece) {
  if (isObject(payloadPiece) && !payloadPiece.id && Object.keys(payloadPiece).length === 1) {
    return Object.values(payloadPiece)[0];
  }

  return payloadPiece;
}
/**
 * Checks the ratio between an array of IDs and a path with wildcards
 *
 * @param {array} ids
 * @param {string} path
 * @param {object} conf (optional - for error handling) the vuex-easy-access config
 * @returns {Bool} true if no problem. false if the ratio is incorrect
 */

function checkIdWildcardRatio(ids, path, conf) {
  var match = path.match(/\*/g);
  var idCount = isArray(match) ? match.length : 0;
  if (ids.length === idCount) return true;
  error('mutationSetterPropPathWildcardIdCount', conf);
  return false;
}
/**
 * Fill in IDs at '*' in a path, based on the IDs received.
 *
 * @param {array} ids
 * @param {string} path 'path.*.with.*.wildcards'
 * @param {object} state RELATIVE TO PATH START! the state to check if the value actually exists
 * @param {object} conf (optional - for error handling) the vuex-easy-access config
 * @returns {string} The path with '*' replaced by IDs
 */

function fillinPathWildcards(ids, path, state, conf) {
  // Ignore pool check if '*' comes last
  var ignorePoolCheckOn = path.endsWith('*') ? ids[ids.length - 1] : null;
  ids.forEach(function (_id, _index, _array) {
    var idIndex = path.indexOf('*');
    var pathUntilPool = path.substring(0, idIndex); // check for errors when both state and conf are passed
    // pathUntilPool can be '' in case the path starts with '*'

    if (ignorePoolCheckOn !== _id && state && conf) {
      var pool = pathUntilPool ? getDeepRef(state, pathUntilPool) : state;
      if (pool[_id] === undefined) return error('mutationSetterPropPathWildcardMissingItemDoesntExist', conf, pathUntilPool, _id);
    }

    path = path.split('').map(function (char, ind) {
      return ind === idIndex ? _id : char;
    }).join('');
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
 * @returns {object} a nested object re-created based on the path & payload
 */

function createObjectFromPath(path, payload, state, conf) {
  var newValue = payload;

  if (path.includes('*')) {
    // only work with arrays
    if (!isArray(payload)) payload = [payload];
    var lastPayloadPiece = payload.pop();
    var ids = payload; // CASE: 'dex/pokemonById.*.tags'

    if (!path.endsWith('*')) {
      newValue = lastPayloadPiece;
    } // CASE: 'dex/pokemonById.*.tags.*'


    if (path.endsWith('*')) {
      var lastId = getId(lastPayloadPiece, conf, path);
      ids.push(lastId);
      newValue = getValueFromPayloadPiece(lastPayloadPiece);
      if (isObject(newValue)) newValue.id = lastId;
    }

    ids = ids.map(function (_id) {
      _id = _id.replace('.', '_____dot_____');
      _id = _id.replace('/', '_____slash_____');
      return _id;
    });
    if (!checkIdWildcardRatio(ids, path, conf)) return;
    var pathWithIds = fillinPathWildcards(ids, path, state, conf);
    path = pathWithIds;
  } // important to set the result here and not return the reduce directly!


  var result = {};
  path.match(/[^\/^\.]+/g).reduce(function (carry, _prop, index, array) {
    _prop = _prop.replace('_____dot_____', '.');
    _prop = _prop.replace('_____slash_____', '/');
    var container = index === array.length - 1 ? newValue : {};
    carry[_prop] = container;
    return container;
  }, result);
  return result;
}
/**
 * Returns the keys of a path
 *
 * @param   {string} path   a/path/like.this
 * @returns {array} with keys
 */

function getKeysFromPath(path) {
  if (!path) return [];
  return path.match(/[^\/^\.]+/g);
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
  var path = arguments.length > 1 ? arguments[1] : undefined;
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
 *
 * @returns {number}          the new length of the array
 */

function pushDeepValue(target, path, value) {
  var deepRef = getDeepRef(target, path);
  if (!isArray(deepRef)) return;
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
  if (!isArray(deepRef)) return;
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
  if (!isArray(deepRef)) return;
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
  var value = arguments.length > 4 ? arguments[4] : undefined;
  var deepRef = getDeepRef(target, path);
  if (!isArray(deepRef)) return;
  if (value === undefined) return deepRef.splice(index, deleteCount);
  return deepRef.splice(index, deleteCount, value);
}

/**
 * Creates the mutations for each property of the object passed recursively
 *
 * @param   {object} propParent an Object of which all props will get a mutation
 * @param   {string} path       the path taken until the current propParent instance
 * @param   {object} conf       user config
 * @param   {string} infoNS     (optional) module namespace in light of ignoreProps config
 *
 * @returns {object}            all mutations for each property.
 */

function makeMutationsForAllProps(propParent, path) {
  var conf = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var infoNS = arguments.length > 3 ? arguments[3] : undefined;
  conf = Object.assign({}, defaultConfig, conf);
  if (!isObject(propParent)) return {};
  return Object.keys(propParent).reduce(function (mutations, prop) {
    // Get the path info up until this point
    var propPath = !path ? prop : path + '.' + prop; // Avoid making setters for private props

    if (conf.ignorePrivateProps && prop[0] === '_') return mutations;

    if (conf.ignoreProps.some(function (ignPropFull) {
      var separatePropFromNS = /(.*?)\/([^\/]*?)$/.exec(ignPropFull);
      var ignPropNS = separatePropFromNS ? separatePropFromNS[1] + '/' : '';
      var ignProp = separatePropFromNS ? separatePropFromNS[2] : ignPropFull;
      return !infoNS && ignProp === propPath || infoNS && infoNS.moduleNamespace == ignPropNS && ignProp === propPath;
    })) {
      return mutations;
    } // Get the value of the prop


    var propValue = propParent[prop]; // define possible functions

    function setProp(state, payload) {
      return setDeepValue(state, propPath, payload);
    }

    function setWildcardProp(state, payload) {
      if (!isArray(payload)) payload = [payload];
      var ids = getIdsFromPayload(payload, conf, propPath);
      if (!checkIdWildcardRatio(ids, propPath, conf)) return;
      var lastId = ids.pop();
      var propPathWithoutLast = propPath.slice(0, -1);
      var pathWithIds = fillinPathWildcards(ids, propPathWithoutLast, state, conf);
      var ref = getDeepRef(state, pathWithIds);
      var newValue = getValueFromPayloadPiece(payload.pop());
      if (isObject(newValue)) newValue.id = lastId;
      if (isObject(propValue)) newValue = merge(propValue, newValue);
      return Vue.set(ref, lastId, newValue);
    }

    function setPropWithWildcardPath(state, payload) {
      if (!isArray(payload)) payload = [payload];
      var newValue = payload.pop();
      var ids = getIdsFromPayload(payload, conf, propPath);
      if (!checkIdWildcardRatio(ids, propPath, conf)) return;
      var pathWithIds = fillinPathWildcards(ids, propPath, state, conf);
      setDeepValue(state, pathWithIds, newValue);
    }

    function deleteProp(state, id) {
      if (!id) return error('mutationDeleteNoId', conf, propPath);
      var ids = !isArray(id) ? [id] : id;
      if (!checkIdWildcardRatio(ids, propPath, conf)) return;
      var lastId = ids.pop();
      var pathWithoutWildcard = propPath.endsWith('*') ? propPath.slice(0, -1) : propPath;
      var pathWithIds = fillinPathWildcards(ids, pathWithoutWildcard, state, conf);
      var ref = getDeepRef(state, pathWithIds);
      return Vue.delete(ref, lastId);
    } // =================================================>
    //   NORMAL MUTATION
    // =================================================>


    var name = conf.pattern === 'traditional' ? 'SET_' + propPath.toUpperCase() : propPath; // All good, make the mutation!

    if (!propPath.includes('*')) {
      mutations[name] = setProp;
    } else if (prop !== '*') {
      // path includes wildcard, but prop is not a wildcard
      mutations[name] = setPropWithWildcardPath;
    } // =================================================>
    //   WILDCARD MUTATIONS
    // =================================================>


    var deleteName = conf.pattern === 'traditional' ? 'DELETE_' + propPath.toUpperCase() : '-' + propPath;

    if (prop === '*') {
      mutations[name] = setWildcardProp;
      mutations[deleteName] = deleteProp;
    } // =================================================>
    //   ARRAY MUTATIONS
    // =================================================>
    // execute mutation


    function executeArrayMutation(state, payload, action) {
      var newValue, pathWithIds;

      if (!propPath.includes('*')) {
        newValue = payload;
        pathWithIds = propPath;
      } else {
        if (!isArray(payload) && action !== 'splice') payload = [payload];
        if (action !== 'pop' && action !== 'shift') newValue = payload.pop();
        var ids = getIdsFromPayload(payload, conf, propPath);
        if (!checkIdWildcardRatio(ids, propPath, conf)) return;
        pathWithIds = fillinPathWildcards(ids, propPath, state, conf);
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
        return spliceDeepValue.apply(void 0, [state, pathWithIds].concat(_toConsumableArray(newValue)));
      }
    }

    if (isArray(propValue)) {
      // PUSH mutation name
      var push = conf.pattern === 'traditional' ? 'PUSH_' + propPath.toUpperCase() : propPath + '.push';

      mutations[push] = function (state, payload) {
        return executeArrayMutation(state, payload, 'push');
      }; // POP mutation name


      var pop = conf.pattern === 'traditional' ? 'POP_' + propPath.toUpperCase() : propPath + '.pop';

      mutations[pop] = function (state, payload) {
        return executeArrayMutation(state, payload, 'pop');
      }; // SHIFT mutation name


      var shift = conf.pattern === 'traditional' ? 'SHIFT_' + propPath.toUpperCase() : propPath + '.shift';

      mutations[shift] = function (state, payload) {
        return executeArrayMutation(state, payload, 'shift');
      }; // SPLICE mutation name


      var splice = conf.pattern === 'traditional' ? 'SPLICE_' + propPath.toUpperCase() : propPath + '.splice';

      mutations[splice] = function (state, payload) {
        return executeArrayMutation(state, payload, 'splice');
      };
    } // =================================================>
    //   CHILDREN MUTATIONS
    // =================================================>


    if (isObject(propValue) && Object.keys(propValue).length) {
      var childrenMutations = makeMutationsForAllProps(propValue, propPath, conf);
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
  var infoNS = arguments.length > 2 ? arguments[2] : undefined;
  conf = Object.assign({}, defaultConfig, conf);
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
  conf = Object.assign({}, defaultConfig, conf); // 'info/user/favColours.primary'

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
  } // [vuex-easy-firestore] check if it's a firestore module


  var firestoreModulePath = !modulePath && props && !props.includes('.') && conf.vuexEasyFirestore ? props + '/' : modulePath;
  var _module = store._modulesNamespaceMap[firestoreModulePath];
  var firestoreConf = !_module ? null : _module.state._conf;

  if (conf.vuexEasyFirestore && firestoreConf) {
    // 'info/user/set', {favColours: {primary: payload}}'
    var newPayload = !props || !modulePath && props && !props.includes('.') ? payload : createObjectFromPath(props, payload, _module.state, conf);
    var firestoreActionPath = firestoreModulePath + 'set';
    var firestoreActionExists = store._actions[firestoreActionPath];

    if (firestoreActionExists) {
      return store.dispatch(firestoreActionPath, newPayload);
    }
  } // Trigger the mutation!


  var mutationName = conf.pattern === 'traditional' ? 'SET_' + props.toUpperCase() // 'SET_FAVCOLOURS.PRIMARY'
  : props; // 'favColours.primary'

  var mutationPath = modulePath + mutationName;
  var mutationExists = store._mutations[mutationPath];

  if (mutationExists) {
    return store.commit(mutationPath, payload);
  }

  return error('missingSetterMutation', conf, mutationPath, props);
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
 * @param   {string}   path     the path of the prop to delete eg. 'info/user/favColours.primary'
 * @param   {*}        payload  either nothing or an id or {id}
 * @param   {object}   store    the store to attach
 * @param   {object}   conf     user config
 *
 * @returns {function}          dispatch or commit
 */


function defaultDeletor(path, payload, store) {
  var conf = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  conf = Object.assign({}, defaultConfig, conf); // 'user/items.*.tags.*'

  var pArr = path.split('/'); // ['user', 'items.*.tags.*']

  var props = pArr.pop(); // 'items.*.tags.*'

  var modulePath = pArr.length ? pArr.join('/') + '/' // 'user/'
  : '';
  var actionName = conf.pattern === 'traditional' ? 'delete' + props[0].toUpperCase() + props.substring(1) // 'deleteItems.*.tags.*'
  : '-' + props; // '-items.*.tags.*'
  // Check if an action exists, if it does, trigger that and return early!

  var actionPath = modulePath + actionName;
  var actionExists = store._actions[actionPath];

  if (actionExists) {
    return store.dispatch(actionPath, payload);
  } // [vuex-easy-firestore] check if it's a firestore module


  var _module = store._modulesNamespaceMap[modulePath];
  var firestoreConf = !_module ? null : _module.state._conf;

  if (conf.vuexEasyFirestore && firestoreConf) {
    // DOC: 'user/favColours.*', 'primary'
    // COLLECTION: 'items.*', '123'
    // COLLECTION: 'items.*.tags.*', ['123', 'dark']
    var ids = !isArray(payload) ? [payload] : payload;
    var newPath = fillinPathWildcards(ids, props, _module.state, conf);
    if (newPath) return store.dispatch(modulePath + 'delete', newPath);
  } // Trigger the mutation!


  var mutationName = conf.pattern === 'traditional' ? 'DELETE_' + props.toUpperCase() // 'DELETE_ITEMS.*.TAGS.*'
  : '-' + props; // '-items.*.tags.*'

  var mutationPath = modulePath + mutationName;
  var mutationExists = store._mutations[mutationPath];

  if (mutationExists) {
    return store.commit(mutationPath, payload);
  }

  return error('missingDeleteMutation', conf, mutationPath, props);
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
  var store = arguments.length > 2 ? arguments[2] : undefined;
  var conf = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  conf = Object.assign({}, defaultConfig, conf);

  function getSetters(_targetState) {
    var _propPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    return Object.keys(_targetState).reduce(function (carry, stateProp) {
      // Get the path info up until this point
      var propPath = _propPath ? _propPath + '.' + stateProp : stateProp;
      var fullPath = moduleNS + propPath; // Avoid making setters for private props

      if (conf.ignorePrivateProps && stateProp[0] === '_') return carry;
      if (conf.ignoreProps.includes(fullPath)) return carry; // Avoid making setters for props which are an entire module on its own

      if (store._modulesNamespaceMap[fullPath + '/']) return carry; // =================================================>
      //   NORMAL SETTER
      // =================================================>
      // All good, make the action!

      carry[propPath] = function (context, payload) {
        return defaultSetter(fullPath, payload, store, conf);
      }; // Get the value of the prop


      var propValue = _targetState[stateProp]; // =================================================>
      //   ARRAY SETTERS
      // =================================================>

      if (isArray(propValue)) {
        carry[propPath + '.push'] = function (context, payload) {
          return defaultSetter(fullPath + '.push', payload, store, conf);
        };

        carry[propPath + '.pop'] = function (context, payload) {
          return defaultSetter(fullPath + '.pop', payload, store, conf);
        };

        carry[propPath + '.shift'] = function (context, payload) {
          return defaultSetter(fullPath + '.shift', payload, store, conf);
        };

        carry[propPath + '.splice'] = function (context, payload) {
          return defaultSetter(fullPath + '.splice', payload, store, conf);
        };
      } // =================================================>
      //   WILDCARDS SETTER
      // =================================================>


      if (isObject(propValue) && !Object.keys(propValue).length) {
        carry[propPath + '.*'] = function (context, payload) {
          return defaultSetter(fullPath + '.*', payload, store, conf);
        };
      } // =================================================>
      //   CHILDREN SETTERS
      // =================================================>
      // let's do it's children as well!


      if (isObject(propValue) && Object.keys(propValue).length) {
        var childrenSetters = getSetters(propValue, propPath);
        Object.assign(carry, childrenSetters);
      }

      return carry;
    }, {});
  }

  var setters = getSetters(targetState);
  return {
    actions: setters,
    namespaced: true
  };
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
  var store = arguments.length > 2 ? arguments[2] : undefined;
  var conf = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  conf = Object.assign({}, defaultConfig, conf);

  function getDeletors(_targetState) {
    var _propPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    return Object.keys(_targetState).reduce(function (carry, stateProp) {
      // Get the path info up until this point
      var propPath = _propPath ? _propPath + '.' + stateProp : stateProp;
      var fullPath = moduleNS + propPath; // Avoid making deletor for private props

      if (conf.ignorePrivateProps && stateProp[0] === '_') return carry;
      if (conf.ignoreProps.includes(fullPath)) return carry; // Avoid making deletor for props which are an entire module on its own

      if (store._modulesNamespaceMap[fullPath + '/']) return carry; // Get the value of the prop

      var propValue = _targetState[stateProp]; // let's create the deletors

      if (stateProp === '*') {
        carry[propPath] = function (context, payload) {
          return defaultDeletor(fullPath, payload, store, conf);
        };
      }

      if (isObject(propValue) && !Object.keys(propValue).length) {
        carry[propPath + '.*'] = function (context, payload) {
          return defaultDeletor(fullPath + '.*', payload, store, conf);
        };
      } // let's do it's children as well!


      if (isObject(propValue) && Object.keys(propValue).length) {
        var childrenDeletors = getDeletors(propValue, propPath);
        Object.assign(carry, childrenDeletors);
      }

      return carry;
    }, {});
  }

  var deletors = getDeletors(targetState);
  return {
    actions: deletors,
    namespaced: true
  };
}

function generateSetterModules(store) {
  var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var modules = store._modulesNamespaceMap;
  conf = Object.assign({}, defaultConfig, conf);
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
  var conf = Object.assign({}, defaultConfig, userConfig);
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

export default createEasyAccess;
export { createEasyAccess, defaultMutations, defaultGetter, defaultSetter, defaultDeletor, getDeepRef, getKeysFromPath };
