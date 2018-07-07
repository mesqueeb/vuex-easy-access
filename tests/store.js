
import { defaultMutations } from '../dist/index.cjs.min'
import config from './config'

function initialState () {
  return {
    pokemonBox: {
      waterPokemon: ['squirtle'],
      items: [],
      _secrets: []
    }
  }
}
const module2State = {
  defeated: {
    palletTown: false,
  }
}
const gymData = {
  namespaced: true,
  state: module2State,
  mutations: defaultMutations(module2State, config)
}
const moduleState = {
  visitedPlaces: {
    palletTown: true,
    gym: false
  }
}
const locationJournal = {
  namespaced: true,
  state: moduleState,
  mutations: defaultMutations(moduleState, config),
  modules: { gymData }
}

export default {
  modules: { locationJournal },
  state: initialState(),
  mutations: defaultMutations(initialState(), config),
  actions: {},
  getters: {}
}
