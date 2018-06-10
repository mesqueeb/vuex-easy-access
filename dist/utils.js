'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Sets the payload to a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to set the value on
 * @param   {string} path     'path.to.sub.prop'
 * @param   {*}      payload  the value to set
 *
 * @returns {object}          the original target object
 */
function setDeepValue(target, path, payload) {
  var keys = path.split('.');
  var obj = target;
  while (obj && keys.length > 1) {
    obj = obj[keys.shift()];
  }
  var key = keys.shift();
  if (obj && obj.hasOwnProperty(key)) {
    obj[key] = payload;
  }
  return target;
}

/**
 * Gets a deep property in an object, based on a path to that property
 *
 * @param   {object} target   the Object to get the value of
 * @param   {string} path     'model/path/path.to.sub.prop'
 *
 * @returns {object}          the property's value
 */
function getDeepValue(target, path) {
  var keys = path.match(/\w+/g);
  var obj = target;
  while (obj && keys.length > 1) {
    obj = obj[keys.shift()];
  }
  var key = keys.shift();
  if (obj && obj.hasOwnProperty(key)) {
    return obj[key];
  }
}

exports.setDeepValue = setDeepValue;
exports.getDeepValue = getDeepValue;