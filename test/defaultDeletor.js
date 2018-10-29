import test from 'ava'
import { formatDeletor } from './helpers/makeSetters.cjs'

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

test('[simple] deletor no module', t => {
  let res, path, payload, store, conf, deletePath
  store = getStore()
  conf = getConf()
  // trigger mutation
  path = 'favColours.primary'
  deletePath = '-favColours.primary'
  store._actions[deletePath] = false
  store._mutations[deletePath] = true
  payload = 'red'
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'commit', _path: deletePath, _payload: 'red'})
  // trigger action
  store._actions[deletePath] = true
  store._mutations[deletePath] = true
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePath, _payload: 'red'})
})

test('[simple] deletor single module & prop', t => {
  let res, path, payload, store, conf, deletePath
  store = getStore()
  conf = getConf()
  // trigger mutation
  path = 'colours/favColour'
  deletePath = 'colours/-favColour'
  store._actions[deletePath] = false
  store._mutations[deletePath] = true
  payload = 'red'
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'commit', _path: deletePath, _payload: 'red'})
  // trigger action
  store._actions[deletePath] = true
  store._mutations[deletePath] = true
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePath, _payload: 'red'})
})

test('[simple] deletor deep', t => {
  let res, path, payload, store, conf, deletePath
  store = getStore()
  conf = getConf()
  // trigger mutation
  path = 'info/user/favColours.primary'
  deletePath = 'info/user/-favColours.primary'
  store._actions[deletePath] = false
  store._mutations[deletePath] = true
  payload = 'red'
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'commit', _path: deletePath, _payload: 'red'})
  // trigger action
  store._actions[deletePath] = true
  store._mutations[deletePath] = true
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePath, _payload: 'red'})
})

test('[traditional] deletor no module', t => {
  let res, path, payload, store, conf, deletePathA, deletePathM
  store = getStore()
  conf = getConf()
  conf.pattern = 'traditional'
  // trigger mutation
  path = 'favColours.primary'
  deletePathA = 'deleteFavColours.primary'
  deletePathM = 'DELETE_FAVCOLOURS.PRIMARY'
  store._actions[deletePathA] = false
  store._mutations[deletePathM] = true
  payload = 'red'
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'commit', _path: deletePathM, _payload: 'red'})
  // trigger action
  store._actions[deletePathA] = true
  store._mutations[deletePathM] = true
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePathA, _payload: 'red'})
})

test('[traditional] deletor single module & prop', t => {
  let res, path, payload, store, conf, deletePathA, deletePathM
  store = getStore()
  conf = getConf()
  conf.pattern = 'traditional'
  // trigger mutation
  path = 'colours/favColour'
  deletePathA = 'colours/deleteFavColour'
  deletePathM = 'colours/DELETE_FAVCOLOUR'
  store._actions[deletePathA] = false
  store._mutations[deletePathM] = true
  payload = 'red'
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'commit', _path: deletePathM, _payload: 'red'})
  // trigger action
  store._actions[deletePathA] = true
  store._mutations[deletePathM] = true
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePathA, _payload: 'red'})
})

test('[traditional] deletor deep', t => {
  let res, path, payload, store, conf, deletePathA, deletePathM
  store = getStore()
  conf = getConf()
  conf.pattern = 'traditional'
  // trigger mutation
  path = 'info/user/favColours.primary'
  deletePathA = 'info/user/deleteFavColours.primary'
  deletePathM = 'info/user/DELETE_FAVCOLOURS.PRIMARY'
  store._actions[deletePathA] = false
  store._mutations[deletePathM] = true
  payload = 'red'
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'commit', _path: deletePathM, _payload: 'red'})
  // trigger action
  store._actions[deletePathA] = true
  store._mutations[deletePathM] = true
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePathA, _payload: 'red'})
})

test('[vuex-easy-firestore] trigger user action first', t => {
  let res, path, payload, store, conf, deletePathA, deletePathEF
  store = getStore()
  conf = getConf()
  conf.vuexEasyFirestore = true
  // trigger user action
  path = 'colours/favColour'
  deletePathA = 'colours/-favColour'
  deletePathEF = 'colours/delete'
  store._modulesNamespaceMap['colours/'] = {state: {_conf: {statePropName: ''}}}
  store._actions[deletePathEF] = true
  store._actions[deletePathA] = true
  payload = 'red'
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePathA, _payload: 'red'})
})

test('[vuex-easy-firestore] deletor single module & prop', t => {
  let res, path, payload, store, conf, deletePath
  store = getStore()
  conf = getConf()
  conf.vuexEasyFirestore = true
  // trigger vuex-easy-firestore action
  path = 'colours/favColour'
  deletePath = 'colours/delete'
  store._modulesNamespaceMap['colours/'] = {state: {_conf: {statePropName: ''}}}
  store._actions[deletePath] = true
  payload = 'red'
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePath, _payload: 'favColour'})
})

test('[vuex-easy-firestore] deletor deep', t => {
  let res, path, payload, store, conf, deletePath
  store = getStore()
  conf = getConf()
  conf.vuexEasyFirestore = true
  // trigger vuex-easy-firestore action
  path = 'info/user/favColours.primary'
  deletePath = 'info/user/delete'
  store._modulesNamespaceMap['info/user/'] = {state: {_conf: {statePropName: ''}}}
  store._actions[deletePath] = true
  payload = 'red'
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePath, _payload: 'favColours.primary'})
})

test('[vuex-easy-firestore] wildcards', t => {
  let res, path, payload, store, conf, deletePath
  store = getStore()
  conf = getConf()
  conf.vuexEasyFirestore = true
  // trigger vuex-easy-firestore action
  store._modulesNamespaceMap['info/user/'] = {state: {_conf: {statePropName: ''}}}
  deletePath = 'info/user/delete'
  store._actions[deletePath] = true
  // 1. end *
  path = 'info/user/favColours.primary.*'
  //     a) proper id
  payload = {red: true}
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePath, _payload: 'favColours.primary.red'})
  path = 'info/user/favColours.primary.*'
  //     b) flat id
  payload = {id: 'red', is: true}
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePath, _payload: 'favColours.primary.red'})
  store.state = {info: {user: {favColours: {primary: {visible: false}}}}}
  store._modulesNamespaceMap['info/user/'].state.favColours = {primary: {visible: false}}
  // 2. mid-way *
  path = 'info/user/favColours.*.visible'
  payload = ['primary', true]
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePath, _payload: 'favColours.primary.visible'})
  // 3. mid-way * and end *
  path = 'info/user/favColours.*.visible.*'
  payload = ['primary', {red: true}]
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePath, _payload: 'favColours.primary.visible.red'})
  // 4. statePropName
  store._modulesNamespaceMap['info/user/'].state._conf.statePropName = 'favColours'
  path = 'info/user/favColours.*.visible.deeper.*'
  payload = ['primary', {red: true}]
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: 'info/user/delete', _payload: 'primary.visible.deeper.red'})
})

test('[vuex-easy-firestore] has statePropName', t => {
  let res, path, payload, store, conf, deletePath
  store = getStore()
  conf = getConf()
  conf.vuexEasyFirestore = true
  // trigger vuex-easy-firestore action
  path = 'info/user/favColours.primary'
  deletePath = 'info/user/delete'
  store._modulesNamespaceMap['info/user/'] = {state: {_conf: {statePropName: 'favColours'}}}
  store._actions[deletePath] = true
  payload = 'red'
  res = formatDeletor(path, payload, store, conf)
  t.deepEqual(res, {command: 'dispatch', _path: deletePath, _payload: 'primary'})
})
