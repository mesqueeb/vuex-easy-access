import test from 'ava'
import store from '../dist/test/helpers/index.cjs.js'

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
