import test from 'ava'
import store from './helpers/index.cjs.js'

test('setters', t => {
  const actions = store._actions
  const mutations = store._mutations
  console.log('store → ', store)
  const props = [
    'user/importedData',
    '_secrets',
    'user/user.secretProp'
  ]
  props.forEach(p => {
    t.falsy(mutations[p])
    t.falsy(mutations[p + '.pop'])
    t.falsy(mutations[p + '.push'])
    t.falsy(mutations[p + '.splice'])
    t.falsy(actions['set/' + p])
    t.falsy(actions['set/' + p + '.pop'])
    t.falsy(actions['set/' + p + '.push'])
    t.falsy(actions['set/' + p + '.splice'])
  })
})
