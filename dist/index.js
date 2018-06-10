'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * Vuex Easy Access plugin
                                                                                                                                                                                                                                                                   * Unified syntax with simple set() and get() store access + auto generate mutations!
                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                   * @author     Luca Ban
                                                                                                                                                                                                                                                                   * @contact    https://lucaban.com
                                                                                                                                                                                                                                                                   */

var _utils = require('./utils');

function isObject(payload) {
  return Object.prototype.toString.call(payload) === '[object Object]';
}

/**
 * Creates the mutations for each property of the object passed recursively
 *
 * @param   {object} propParent an Object of which all props will get a mutation
 * @param   {string} path       the path taken until the current propParent instance
 *
 * @returns {object}            all mutations for each property.
 */
function makeMutationsForAllProps(propParent, path) {
  if (!isObject(propParent)) return {};
  return Object.keys(propParent).reduce(function (mutations, prop) {
    var propPath = !path ? prop : path + '.' + prop;
    var name = 'SET_' + propPath.toUpperCase();
    mutations[name] = function (state, newVal) {
      return (0, _utils.setDeepValue)(state, propPath, newVal);
    };
    var propValue = propParent[prop];
    if (isObject(propValue)) {
      var childrenMutations = makeMutationsForAllProps(propValue, propPath);
      mutations = _extends({}, mutations, childrenMutations);
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
function defaultSetter(path, payload, store) {
  // path = 'info/user/favColours.primary'
  var pArr = path.split('/');
  // ['info', 'user', 'favColours.primary']
  var props = pArr.pop();
  // 'favColours.primary'
  var modulePath = pArr.join('/');
  // 'info/user'
  var actionName = 'set' + props[0].toUpperCase() + props.substring(1);
  // 'setFavColours.primary'
  var actionPath = modulePath + '/' + actionName;
  // 'info/user/setFavColours.primary'
  var action = store._actions[actionPath];
  if (action) {
    return store.dispatch(actionPath, payload);
  }
  var mutationPath = modulePath + '/SET_' + props.toUpperCase();
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
  return (0, _utils.getDeepValue)(store.state, path);
}

module.exports = { defaultMutations: defaultMutations, defaultSetter: defaultSetter, defaultGetter: defaultGetter };