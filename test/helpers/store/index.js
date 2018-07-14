import { defaultMutations } from '../../../src/index'
import config from '../config'
import locationJournal from './locationJournal'
import user from './user'
import dex from './dex'

// Store root state
function initialState () {
  return {
    pokemonBox: {
      waterPokemon: ['squirtle'],
      items: [],
      _secrets: []
    },
    wallet: [],
  }
}

// export store
export default {
  modules: { locationJournal, user, dex },
  state: initialState(),
  mutations: defaultMutations(initialState(), config, {moduleNamespace: ''}),
  actions: {},
  getters: {}
}
