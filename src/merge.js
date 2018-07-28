import { isObject } from 'is-what'
import nanomerge from 'nanomerge'
// import deepAssign from 'deep-object-assign-with-reduce'
// const mergeOptions = require('merge-options')
// import deepmerge from 'deepmerge'

function merge (...params) {
  // check if all are objects
  let l = params.length
  for (l; l > 0; l--) {
    const item = params[l - 1]
    if (!isObject(item)) {
      console.error('trying to merge a non-object: ', item)
      return item
    }
  }
  return nanomerge(...params)
  // return deepAssign(...params)
  // return mergeOptions(...params)
  // settings for 'deepmerge'
  // const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray
  // const options = {arrayMerge: overwriteMerge}
  // if (params.length > 2) {
  //   return deepmerge.all([...params], options)
  // }
  // return deepmerge(...params, options)
}

export default merge
