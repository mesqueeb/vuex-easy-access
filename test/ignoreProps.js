import test from 'ava'
import store from './helpers/index.cjs.js'

test('setters', t => {
  const actions = store._actions
  const mutations = store._mutations
  console.log('store → ', store)
  const checkProps = [
    {module: '', prop: '_secrets', ignored: true},
    {module: '', prop: 'wallet', ignored: true},
    {module: 'user/', prop: 'wallet', ignored: false},
    {module: 'user/', prop: 'importedData', ignored: true},
    {module: 'user/', prop: 'user.secretProp', ignored: true},
  ]
  checkProps.forEach(p => {
    const checkFor = (p.ignored) ? 'falsy' : 'truthy'
    t[checkFor](mutations[`${p.module}${p.prop}`])
    t[checkFor](mutations[`${p.module}${p.prop}.pop`])
    t[checkFor](mutations[`${p.module}${p.prop}.push`])
    t[checkFor](mutations[`${p.module}${p.prop}.splice`])
    t[checkFor](actions[`${p.module}set/${p.prop}`])
    // NOT YET IMPLEMENTED:
    // t[checkFor](actions[`${p.module}set/${p.prop}.pop`])
    // t[checkFor](actions[`${p.module}set/${p.prop}.push`])
    // t[checkFor](actions[`${p.module}set/${p.prop}.splice`])
  })
})
