import test from 'ava'
import store from './helpers/index.cjs.js'

test('makeMutations', t => {
  const mutations = store._mutations
  const expectedMutations = [
    'pokemonBox',
    'pokemonBox.waterPokemon',
    'pokemonBox.waterPokemon.pop',
    'pokemonBox.waterPokemon.push',
    'pokemonBox.waterPokemon.splice',
    'pokemonBox.items',
    'pokemonBox.items.pop',
    'pokemonBox.items.push',
    'pokemonBox.items.splice',
    'locationJournal/visitedPlaces',
    'locationJournal/visitedPlaces.palletTown',
    'locationJournal/visitedPlaces.gym',
    'locationJournal/gymData/defeated',
    'locationJournal/gymData/defeated.palletTown'
  ]
  expectedMutations.forEach(m => t.truthy(mutations[m]))
})

test('makeActions', t => {
  const actions = store._actions
  const expectedActions = [
    'locationJournal/set/visitedPlaces',
    'locationJournal/set/visitedPlaces.palletTown',
    'locationJournal/set/visitedPlaces.gym',
    'locationJournal/gymData/set/defeated',
    'locationJournal/gymData/set/defeated.palletTown',
    'set/pokemonBox',
    'set/pokemonBox.waterPokemon',
    'set/pokemonBox.items',
    'user/set/user'
  ]
  expectedActions.forEach(a => t.truthy(actions[a]))
})

test('makeSetterModules', t => {
  const modules = store._modulesNamespaceMap
  const expectedModules = [
    'user/set/',
    'locationJournal/set/',
    'locationJournal/gymData/set/',
    'set/'
  ]
  expectedModules.forEach(m => t.truthy(modules[m]))
})
