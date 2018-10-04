import createFirestores from 'vuex-easy-firestore'
import { createEasyAccess, defaultMutations } from '../../../dist/index.cjs'
import config from '../config'
import locationJournal from './locationJournal'
import { user, firestoreUser } from './user'
import { dex, firestoreDex } from './dex'
import { friendsList } from './friendsList'

// set plugins
const easyAccess = createEasyAccess(config)
const easyFirestores = createFirestores([firestoreDex, firestoreUser])

// Store root state
function initialState () {
  return {
    pokemonBox: {
      waterPokemon: ['squirtle'],
      items: [],
      _secrets: []
    },
    wallet: [],
    propToBeDeleted_commit: true,
    propToBeDeleted_dispatch: true,
    propToBeDeleted_delete: true
  }
}

// export store
export default {
  modules: { locationJournal, user, dex, friendsList },
  state: initialState(),
  mutations: defaultMutations(initialState(), config, {moduleNamespace: ''}),
  actions: {},
  getters: {},
  plugins: [easyFirestores, easyAccess]
}
