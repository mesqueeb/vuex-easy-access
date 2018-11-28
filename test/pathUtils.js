import test from 'ava'
import {
  getIdsFromPayload,
  checkIdWildcardRatio,
  getValueFromPayloadPiece,
  fillinPathWildcards,
  createObjectFromPath,
  getKeysFromPath,
  getDeepRef,
  getDeepValue,
  setDeepValue,
  pushDeepValue,
  popDeepValue,
  shiftDeepValue,
  spliceDeepValue,
} from './helpers/pathUtils.cjs'

test('getIdsFromPayload', t => {
  let payload, res
  payload = ['001']
  res = getIdsFromPayload(payload)
  t.is(res[0], '001')
  payload = ['001', '002']
  res = getIdsFromPayload(payload)
  t.is(res[0], '001')
  t.is(res[1], '002')
  payload = ['001', {'002': true}, {'003': {id: 'fake'}}, {id: '004', vals: 'fake'}]
  res = getIdsFromPayload(payload)
  t.is(res[0], '001')
  t.is(res[1], '002')
  t.is(res[2], '003')
  t.is(res[3], '004')
})
test('checkIdWildcardRatio', t => {
  let ids, path, conf, res
  ids = ['001']
  path = 'dex/pokemonById.*'
  res = checkIdWildcardRatio(ids, path, conf)
  t.is(res, true)
  ids = ['001']
  path = 'dex/pokemonById.*.tags.*'
  res = checkIdWildcardRatio(ids, path, conf)
  t.is(res, false)
})
test('getValueFromPayloadPiece', t => {
  let payloadPiece, res
  payloadPiece = '001'
  res = getValueFromPayloadPiece(payloadPiece)
  t.deepEqual(res, '001')
  payloadPiece = {'002': true}
  res = getValueFromPayloadPiece(payloadPiece)
  t.deepEqual(res, true)
  payloadPiece = {'003': {id: 'fake'}}
  res = getValueFromPayloadPiece(payloadPiece)
  t.deepEqual(res, {id: 'fake'})
  payloadPiece = {id: '004', vals: 'fake'}
  res = getValueFromPayloadPiece(payloadPiece)
  t.deepEqual(res, {id: '004', vals: 'fake'})
})
test('fillinPathWildcards', t => {
  let ids, path, state, conf, res
  ids = ['001', 'water']
  path = 'dex/pokemonById.*.tags.*'
  res = fillinPathWildcards(ids, path, state, conf)
  t.is(res, 'dex/pokemonById.001.tags.water')
  path = 'dex/pokemonById.*.tags'
  res = fillinPathWildcards(ids, path, state, conf)
  t.is(res, 'dex/pokemonById.001.tags')
  path = 'dex/*.tags.*'
  res = fillinPathWildcards(ids, path, state, conf)
  t.is(res, 'dex/001.tags.water')
  path = '*.tags.*'
  res = fillinPathWildcards(ids, path, state, conf)
  t.is(res, '001.tags.water')
  path = '*.tags.deeper.*'
  res = fillinPathWildcards(ids, path, state, conf)
  t.is(res, '001.tags.deeper.water')
  path = '*.tags.deeper.d.d.d.*'
  res = fillinPathWildcards(ids, path, state, conf)
  t.is(res, '001.tags.deeper.d.d.d.water')
  path = '*'
  res = fillinPathWildcards(['001'], path, state, conf)
  t.is(res, '001')
})
test('fillinPathWildcards without *', t => {
  let path, res, state, conf
  path = 'a/random/path.with.vals-!'
  res = fillinPathWildcards([], path, state, conf)
  t.is(res, 'a/random/path.with.vals-!')
})
test('createObjectFromPath', t => {
  let path, payload, state, conf, res
  path = '*'
  payload = {'001': {name: 'bulba'}}
  res = createObjectFromPath(path, payload, state, conf)
  t.deepEqual(res, {'001': {name: 'bulba'}})

  path = 'test'
  payload = {'001': {name: 'bulba'}}
  res = createObjectFromPath(path, payload, state, conf)
  console.log('res → ', res)
  t.deepEqual(res, {test: {'001': {name: 'bulba'}}})

  path = 'locationJournal/gymData/defeated.palletTown'
  payload = true
  res = createObjectFromPath(path, payload, state, conf)
  t.deepEqual(res, {locationJournal: {gymData: {defeated: {palletTown: true}}}})

  path = 'dex/pokemonById.*'
  payload = {id: '001', name: 'bulba'}
  res = createObjectFromPath(path, payload, state, conf)
  t.deepEqual(res, {dex: {pokemonById: {'001': {id: '001', name: 'bulba'}}}})

  path = 'dex/pokemonById.*'
  payload = {'001': {name: 'bulba'}}
  res = createObjectFromPath(path, payload, state, conf)
  t.deepEqual(res, {dex: {pokemonById: {'001': {id: '001', name: 'bulba'}}}})

  path = 'dex/*.tags'
  payload = ['001', []]
  res = createObjectFromPath(path, payload, state, conf)
  t.deepEqual(res, {dex: {'001': {tags: []}}})

  path = 'dex/pokemonById.*.tags'
  payload = ['001', {dark: true}]
  res = createObjectFromPath(path, payload, state, conf)
  t.deepEqual(res, {dex: {pokemonById: {'001': {tags: {dark: true}}}}})

  path = 'dex/pokemonById.*.tags'
  payload = ['001', ['nieuwe', 'tags']]
  res = createObjectFromPath(path, payload, state, conf)
  t.deepEqual(res, {dex: {pokemonById: {'001': {tags: ['nieuwe', 'tags']}}}})

  path = 'dex/pokemonById.*.tags.*'
  payload = ['001', {dark: true}]
  res = createObjectFromPath(path, payload, state, conf)
  t.deepEqual(res, {dex: {pokemonById: {'001': {tags: {dark: true}}}}})

  path = 'dex/pokemonById.*.tags.*'
  payload = ['001', {id: 'dark', state: true}]
  res = createObjectFromPath(path, payload, state, conf)
  t.deepEqual(res, {dex: {pokemonById: {'001': {tags: {dark: {id: 'dark', state: true}}}}}})

  path = 'dex/pokemonById.*.tags.*'
  payload = ['001/m', {id: 'dark@universe.com', state: true}]
  res = createObjectFromPath(path, payload, state, conf)
  t.deepEqual(res, {dex: {pokemonById: {'001/m': {tags: {'dark@universe.com': {id: 'dark@universe.com', state: true}}}}}})
})
test('getKeysFromPath', t => {
  let path, res
  path = 'dex/pokemonById.*.tags.*'
  res = getKeysFromPath(path)
  t.deepEqual(res, ['dex', 'pokemonById', '*', 'tags', '*'])
  path = '_/dex 1/pokemon-By-Id.*._tags_.*123 abc'
  res = getKeysFromPath(path)
  t.deepEqual(res, ['_', 'dex 1', 'pokemon-By-Id', '*', '_tags_', '*123 abc'])
})
test('getDeepRef', t => {
  let target, path, res
  target = {dex: {pokemonById: {'001': {tags: {grass: true, water: false}}}}}
  path = 'dex/pokemonById.001.tags.water'
  res = getDeepRef(target, path)
  t.is(res, target.dex.pokemonById['001'].tags.water)
  t.is(res, target.dex.pokemonById['001'].tags.water)
  path = 'dex/pokemonById.001.tags'
  res = getDeepRef(target, path)
  t.is(res, target.dex.pokemonById['001'].tags)
  t.deepEqual(res, {grass: true, water: false})
})
test('getDeepRef returns target on empty string', t => {
  let res
  res = getDeepRef({theState: true}, '')
  t.deepEqual(res, {theState: true})
})
test('getDeepValue', t => {
  let target, path, res
  target = {dex: {pokemonById: {'001': {tags: {grass: true, water: false}}}}}
  path = 'dex/pokemonById.001.tags.water'
  res = getDeepValue(target, path)
  t.is(res, target.dex.pokemonById['001'].tags.water)
  path = 'dex/pokemonById.001.tags'
  res = getDeepValue(target, path)
  t.is(res, target.dex.pokemonById['001'].tags)
  t.deepEqual(res, {grass: true, water: false})
})
test('setDeepValue', t => {
  let target, path, value, res
  target = {dex: {pokemonById: {'001': {tags: {grass: true, water: false}}}}}
  path = 'dex/pokemonById.001.tags.water'
  res = setDeepValue(target, path, 'wazegdegijnu')
  t.is(target.dex.pokemonById['001'].tags.water, 'wazegdegijnu')
  path = 'dex/pokemonById.001.tags'
  res = setDeepValue(target, path, ['1'])
  t.deepEqual(target.dex.pokemonById['001'].tags, ['1'])
})
test('pushDeepValue', t => {
  let target, path, value, res
  target = {dex: {pokemonById: {'001': {tags: ['0', '1', '2', '3']}}}}
  path = 'dex/pokemonById.001.tags'
  res = pushDeepValue(target, path, 'squirt')
  t.deepEqual(target.dex.pokemonById['001'].tags, ['0', '1', '2', '3', 'squirt'])
  t.is(res, 5)
})
test('popDeepValue', t => {
  let target, path, res
  target = {dex: {pokemonById: {'001': {tags: ['0', '1', '2', '3']}}}}
  path = 'dex/pokemonById.001.tags'
  res = popDeepValue(target, path)
  t.deepEqual(target.dex.pokemonById['001'].tags, ['0', '1', '2'])
  t.is(res, '3')
})
test('shiftDeepValue', t => {
  let target, path, res
  target = {dex: {pokemonById: {'001': {tags: ['0', '1', '2', '3']}}}}
  path = 'dex/pokemonById.001.tags'
  res = shiftDeepValue(target, path)
  t.deepEqual(target.dex.pokemonById['001'].tags, ['1', '2', '3'])
  t.is(res, '0')
})
test('spliceDeepValue', t => {
  let target, path, index, deleteCount, value, res
  path = 'dex/pokemonById.001.tags'
  target = {dex: {pokemonById: {'001': {tags: ['0', '1', '2', '3']}}}}
  res = spliceDeepValue(target, path, 0, 1, 'squirt')
  t.deepEqual(target.dex.pokemonById['001'].tags, ['squirt', '1', '2', '3'])
  t.deepEqual(res, ['0'])
  target = {dex: {pokemonById: {'001': {tags: ['0', '1', '2', '3']}}}}
  res = spliceDeepValue(target, path, 1, 0, 'squirt')
  t.deepEqual(target.dex.pokemonById['001'].tags, ['0', 'squirt', '1', '2', '3'])
  t.deepEqual(res, [])
  target = {dex: {pokemonById: {'001': {tags: ['0', '1', '2', '3']}}}}
  res = spliceDeepValue(target, path, 2, 2, 'squirt')
  t.deepEqual(target.dex.pokemonById['001'].tags, ['0', '1', 'squirt'])
  t.deepEqual(res, ['2', '3'])
  target = {dex: {pokemonById: {'001': {tags: ['0', '1', '2', '3']}}}}
  res = spliceDeepValue(target, path, 1, 1)
  t.deepEqual(target.dex.pokemonById['001'].tags, ['0', '2', '3'])
  t.deepEqual(res, ['1'])
})
