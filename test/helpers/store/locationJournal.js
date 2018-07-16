import { defaultMutations } from '../../../src/index'
import config from '../config'

// MODULE: gymData
const gymDataState = {
  defeated: {
    '*': false,
    palletTown: false,
  }
}
const gymData = {
  namespaced: true,
  state: gymDataState,
  mutations: defaultMutations(gymDataState, config, {moduleNamespace: 'locationJournal/gymData/'})
}

// MODULE: locationJournal
const locationJournalState = {
  visitedPlaces: {
    '*': {
      visited: false,
      gym: false,
      pokecentre: false,
    },
    palletTown: {
      visited: true,
      gym: false,
    }
  }
}
const locationJournal = {
  namespaced: true,
  state: locationJournalState,
  mutations: defaultMutations(locationJournalState, config, {moduleNamespace: 'locationJournal'}),
  modules: { gymData }
}

export default locationJournal
