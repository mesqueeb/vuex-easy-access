
import { defaultMutations } from '../../dist/index.cjs.min'
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
const userState = { user: null }
const userModule = {
  namespaced: true,
  state: userState,
  mutations: defaultMutations(userState, config)
}

export default {
  modules: { locationJournal, user: userModule },
  state: initialState(),
  mutations: defaultMutations(initialState(), config),
  actions: {},
  getters: {}
}
