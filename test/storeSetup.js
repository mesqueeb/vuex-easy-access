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
    'locationJournal/visitedPlaces.*',
    'locationJournal/-visitedPlaces.*',
    'locationJournal/visitedPlaces.*.visited',
    'locationJournal/visitedPlaces.*.gym',
    'locationJournal/visitedPlaces.palletTown',
    'locationJournal/visitedPlaces.palletTown.visited',
    'locationJournal/visitedPlaces.palletTown.gym',
    'locationJournal/gymData/defeated',
    'locationJournal/gymData/defeated.*',
    'locationJournal/gymData/defeated.palletTown',
    'dex/pokemonById',
    'dex/pokemonById.*',
    'dex/-pokemonById.*',
  ]
  expectedMutations.forEach(m => t.truthy(mutations[m]))
})

test('makeActions', t => {
  const actions = store._actions
  const expectedActions = [
    'locationJournal/set/visitedPlaces',
    'locationJournal/set/visitedPlaces.*',
    'locationJournal/delete/visitedPlaces.*',
    'locationJournal/set/visitedPlaces.*.visited',
    'locationJournal/set/visitedPlaces.*.gym',
    'locationJournal/set/visitedPlaces.palletTown',
    'locationJournal/set/visitedPlaces.palletTown.visited',
    'locationJournal/set/visitedPlaces.palletTown.gym',
    'locationJournal/set/visitedPlaces',
    'locationJournal/gymData/set/defeated',
    'locationJournal/gymData/set/defeated.*',
    'locationJournal/gymData/delete/defeated.*',
    'locationJournal/gymData/set/defeated.palletTown',
    'set/pokemonBox',
    'set/pokemonBox.waterPokemon',
    'set/pokemonBox.items',
    'set/pokemonBox.items.pop',
    'set/pokemonBox.items.push',
    'set/pokemonBox.items.splice',
    'user/set/user',
    'dex/set/pokemonById',
    'dex/set/pokemonById.*',
    'dex/delete/pokemonById.*',
  ]
  expectedActions.forEach(a => t.truthy(actions[a]))
})

test('makeSetterModules', t => {
  const modules = store._modulesNamespaceMap
  const expectedModules = [
    'user/set/',
    'locationJournal/set/',
    'locationJournal/delete/',
    'locationJournal/gymData/set/',
    'locationJournal/gymData/delete/',
    'dex/set/',
    'dex/delete/',
    'set/',
  ]
  expectedModules.forEach(m => t.truthy(modules[m]))
})
