import { defaultMutations } from '../../src/index'
import config from './config'
import locationJournal from './modules/locationJournal'
import user from './modules/user'

// Store root state
function initialState () {
  return {
    pokemonBox: {
      waterPokemon: ['squirtle'],
      items: [],
      _secrets: []
    },
    wallet: 0,
  }
}

// export store
export default {
  modules: { locationJournal, user },
  state: initialState(),
  mutations: defaultMutations(initialState(), config),
  actions: {},
  getters: {}
}
