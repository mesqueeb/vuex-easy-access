
import { defaultMutations } from '../../dist/index.cjs.min'
import config from './config'

// Store root state
function initialState () {
  return {
    pokemonBox: {
      waterPokemon: ['squirtle'],
      items: [],
      _secrets: []
    }
  }
}

// MODULE: gymData
const gymDataState = {
  defeated: {
    palletTown: false,
  }
}
const gymData = {
  namespaced: true,
  state: gymDataState,
  mutations: defaultMutations(gymDataState, config)
}

// MODULE: locationJournal
const locationJournalState = {
  visitedPlaces: {
    palletTown: true,
    gym: false
  }
}
const locationJournal = {
  namespaced: true,
  state: locationJournalState,
  mutations: defaultMutations(locationJournalState, config),
  modules: { gymData }
}

// MODULE: user
const userState = { user: {secretProp: null}, importedData: [] }
const user = {
  namespaced: true,
  state: userState,
  mutations: defaultMutations(userState, config)
}

// export store
export default {
  modules: { locationJournal, user },
  state: initialState(),
  mutations: defaultMutations(initialState(), config),
  actions: {},
  getters: {}
}
