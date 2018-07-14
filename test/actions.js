import test from 'ava'
import store from './helpers/index.cjs.js'

test('setters', t => {
  const modulePath = 'locationJournal/gymData/'
  const prop = 'defeated.palletTown'
  const a = store.get(modulePath + prop)
  store.set(modulePath + prop, 1)
  const b = store.get(modulePath + prop)
  t.is(b, 1)
  store.dispatch(modulePath + 'set/defeated.palletTown', 2)
  const c = store.get(modulePath + prop)
  t.is(c, 2)
  store.commit(modulePath + prop, 3)
  const d = store.get(modulePath + prop)
  t.is(d, 3)
  t.is(store.state.locationJournal.gymData.defeated.palletTown, 3)
})

test('arraySetters', t => {
  const modulePath = ''
  const prop = 'pokemonBox.waterPokemon'
  const a = store.get(modulePath + prop)
  const popVal = store.commit(modulePath + prop + '.pop')
  const b = store.get(modulePath + prop)
  t.true(Array.isArray(b))
  t.is(b.length, 0)
  store.commit(modulePath + prop + '.push', 'charmander')
  const c = store.get(modulePath + prop)
  t.is(c.length, 1)
  t.true(c.includes('charmander'))
  store.commit(modulePath + prop + '.splice', [0, 0, 'bulbasaur'])
  const d = store.get(modulePath + prop)
  t.is(d.length, 2)
  t.true(c.includes('charmander'))
  t.true(c.includes('bulbasaur'))
})

test('objectSetters', t => {
  const modulePath = 'dex/'
  const prop = 'pokemonById'
  // Add items
  store.set(modulePath + prop + '.*', {id: '001', name: 'bulbasaur'})
  store.commit(modulePath + prop + '.*', {id: '004', name: 'charmender'})
  store.dispatch(modulePath + 'set/' + prop + '.*', {id: '007', name: 'squirtle'})
  // add some more to test deletions
  store.set(modulePath + prop + '.*', {id: '002', name: 'ivysaur'})
  store.set(modulePath + prop + '.*', {id: '003', name: 'venusaur'})
  store.set(modulePath + prop + '.*', {id: '005', name: 'charmeleon'})
  store.set(modulePath + prop + '.*', {id: '006', name: 'charizard'})
  store.set(modulePath + prop + '.*', {id: '008', name: 'warturtle'})
  store.set(modulePath + prop + '.*', {id: '009', name: 'blastoise'})
  // check amount
  let dex = store.state.dex.pokemonById
  t.is(Object.keys(dex).length, 9)
  // make deletions
  store.delete(modulePath + prop, '002')
  store.delete(modulePath + prop + '.*', {id: '003'})
  store.commit(modulePath + '-' + prop, '005')
  store.commit(modulePath + '-' + prop + '.*', {id: '006'})
  store.dispatch(modulePath + 'delete/' + prop, '008')
  store.dispatch(modulePath + 'delete/' + prop + '.*', {id: '009'})
  // check all are deleted
  dex = store.state.dex.pokemonById
  t.falsy(dex['002'])
  t.falsy(dex['003'])
  t.falsy(dex['005'])
  t.falsy(dex['006'])
  t.falsy(dex['008'])
  t.falsy(dex['009'])
  // check if additions are still there
  t.is(dex['001'].name, 'bulbasaur')
  t.truthy(dex['001'])
  t.is(dex['004'].name, 'charmender')
  t.truthy(dex['004'])
  t.is(dex['007'].name, 'squirtle')
  t.truthy(dex['007'])
  t.is(Object.keys(dex).length, 3)
})
