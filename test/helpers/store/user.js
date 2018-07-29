import { defaultMutations } from '../../../src/index'
import config from '../config'

// MODULE: user
const userState = {
  user: {secretProp: []},
  importedData: [],
  wallet: []
}

export const user = {
  namespaced: true,
  state: userState,
  actions: {
    wallet ({state}, newVal) {
      return newVal + '!'
    },
  },
  mutations: defaultMutations(userState, config, {moduleNamespace: 'user/'})
}

export const firestoreUser = {
  // firestore settings
  firestorePath: 'fakePath',
  firestoreRefType: 'doc',
  moduleName: 'userDB',
  statePropName: 'user',
  // the rest
  namespaced: true,
  state: userState,
  mutations: defaultMutations(userState, config, {moduleNamespace: 'userDB/'})
}
