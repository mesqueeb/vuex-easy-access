import test from 'ava'
import { formatSetter } from './helpers/makeSetters.cjs'

function getStore () {
  return {
    state: {},
    _actions: {},
    _mutations: {},
    _modulesNamespaceMap: {}
  }
}

function getConf () {
  return {
    setter: 'set',
    getter: 'get',
    deletor: 'delete',
    vuexEasyFirestore: false,
    ignorePrivateProps: true,
    ignoreProps: [],
    pattern: 'simple'
  }
}

test('[simple] setters no module', t => {
  let res, path, payload, store, conf
  store = getStore()
  conf = getConf()
  // trigger mutation
  path = 'favColours.primary'
  store._actions[path] = false
  store._mutations[path] = true
  payload = 'red'
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'commit', _path: 'favColours.primary', _payload: 'red'})
  // trigger action
  store._actions[path] = true
  store._mutations[path] = true
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'favColours.primary', _payload: 'red'})
})

test('[simple] setters single module & prop', t => {
  let res, path, payload, store, conf
  store = getStore()
  conf = getConf()
  // trigger mutation
  path = 'colours/favColour'
  store._actions[path] = false
  store._mutations[path] = true
  payload = 'red'
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'commit', _path: 'colours/favColour', _payload: 'red'})
  // trigger action
  store._actions[path] = true
  store._mutations[path] = true
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'colours/favColour', _payload: 'red'})
})

test('[simple] setters deep', t => {
  let res, path, payload, store, conf
  store = getStore()
  conf = getConf()
  // trigger mutation
  path = 'info/user/favColours.primary'
  store._actions[path] = false
  store._mutations[path] = true
  payload = 'red'
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'commit', _path: 'info/user/favColours.primary', _payload: 'red'})
  // trigger action
  store._actions[path] = true
  store._mutations[path] = true
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'info/user/favColours.primary', _payload: 'red'})
})

test('[traditional] setters no module', t => {
  let res, path, payload, store, conf
  store = getStore()
  conf = getConf()
  conf.pattern = 'traditional'
  // trigger mutation
  path = 'favColours.primary'
  store._actions['setFavColours.primary'] = false
  store._mutations['SET_FAVCOLOURS.PRIMARY'] = true
  payload = 'red'
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'commit', _path: 'SET_FAVCOLOURS.PRIMARY', _payload: 'red'})
  // trigger action
  store._actions['setFavColours.primary'] = true
  store._mutations['SET_FAVCOLOURS.PRIMARY'] = true
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'setFavColours.primary', _payload: 'red'})
})

test('[traditional] setters single module & prop', t => {
  let res, path, payload, store, conf
  store = getStore()
  conf = getConf()
  conf.pattern = 'traditional'
  // trigger mutation
  path = 'colours/favColour'
  store._actions['colours/setFavColour'] = false
  store._mutations['colours/SET_FAVCOLOUR'] = true
  payload = 'red'
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'commit', _path: 'colours/SET_FAVCOLOUR', _payload: 'red'})
  // trigger action
  store._actions['colours/setFavColour'] = true
  store._mutations['colours/SET_FAVCOLOUR'] = true
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'colours/setFavColour', _payload: 'red'})
})

test('[traditional] setters deep', t => {
  let res, path, payload, store, conf
  store = getStore()
  conf = getConf()
  conf.pattern = 'traditional'
  // trigger mutation
  path = 'info/user/favColours.primary'
  store._actions['info/user/setFavColours.primary'] = false
  store._mutations['info/user/SET_FAVCOLOURS.PRIMARY'] = true
  payload = 'red'
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'commit', _path: 'info/user/SET_FAVCOLOURS.PRIMARY', _payload: 'red'})
  // trigger action
  store._actions['info/user/setFavColours.primary'] = true
  store._mutations['info/user/SET_FAVCOLOURS.PRIMARY'] = true
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'info/user/setFavColours.primary', _payload: 'red'})
})

test('[vuex-easy-firestore] trigger user action first', t => {
  let res, path, payload, store, conf
  store = getStore()
  conf = getConf()
  conf.vuexEasyFirestore = true
  // trigger user action
  path = 'colours/favColour'
  store._modulesNamespaceMap['colours/'] = {state: {_conf: {statePropName: ''}}}
  store._actions['colours/set'] = true
  store._actions[path] = true
  payload = 'red'
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'colours/favColour', _payload: 'red'})
})

test('[vuex-easy-firestore] setters single module & prop', t => {
  let res, path, payload, store, conf
  store = getStore()
  conf = getConf()
  conf.vuexEasyFirestore = true
  // trigger vuex-easy-firestore action
  path = 'colours/favColour'
  store._modulesNamespaceMap['colours/'] = {state: {_conf: {statePropName: ''}}}
  store._actions['colours/set'] = true
  payload = 'red'
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'colours/set', _payload: {favColour: 'red'}})
})

test('[vuex-easy-firestore] setters deep', t => {
  let res, path, payload, store, conf
  store = getStore()
  conf = getConf()
  conf.vuexEasyFirestore = true
  // trigger vuex-easy-firestore action
  path = 'info/user/favColours.primary'
  store._modulesNamespaceMap['info/user/'] = {state: {_conf: {statePropName: ''}}}
  store._actions['info/user/set'] = true
  payload = 'red'
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'info/user/set', _payload: {favColours: {primary: 'red'}}})
})

test('[vuex-easy-firestore] wildcards', t => {
  let res, path, payload, store, conf
  store = getStore()
  conf = getConf()
  conf.vuexEasyFirestore = true
  // trigger vuex-easy-firestore action
  store._modulesNamespaceMap['info/user/'] = {state: {_conf: {statePropName: ''}}}
  store._actions['info/user/set'] = true
  // 1. end *
  path = 'info/user/favColours.primary.*'
  //     a) proper id
  payload = {red: true}
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'info/user/set', _payload: {favColours: {primary: {red: true}}}})
  path = 'info/user/favColours.primary.*'
  //     b) flat id
  payload = {id: 'red', is: true}
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'info/user/set', _payload: {favColours: {primary: {red: {id: 'red', is: true}}}}})
  store.state = {info: {user: {favColours: {primary: {visible: false}}}}}
  store._modulesNamespaceMap['info/user/'].state.favColours = {primary: {visible: false}}
  // 2. mid-way *
  path = 'info/user/favColours.*.visible'
  payload = ['primary', true]
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'info/user/set', _payload: {favColours: {primary: {visible: true}}}})
  // 3. mid-way * and end *
  path = 'info/user/favColours.*.visible.*'
  payload = ['primary', {red: true}]
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'info/user/set', _payload: {favColours: {primary: {visible: {red: true}}}}})
  // 4. statePropName
  store._modulesNamespaceMap['info/user/'].state._conf.statePropName = 'favColours'
  path = 'info/user/favColours.*.visible.deeper.*'
  payload = ['primary', {red: true}]
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'info/user/set', _payload: {primary: {visible: {deeper: {red: true}}}}})
})

test('[vuex-easy-firestore] has statePropName', t => {
  let res, path, payload, store, conf
  store = getStore()
  conf = getConf()
  conf.vuexEasyFirestore = true
  // trigger vuex-easy-firestore action
  path = 'info/user/favColours.primary'
  store._modulesNamespaceMap['info/user/'] = {state: {_conf: {statePropName: 'favColours'}}}
  store._actions['info/user/set'] = true
  payload = 'red'
  res = formatSetter(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'info/user/set', _payload: {primary: 'red'}})
})
