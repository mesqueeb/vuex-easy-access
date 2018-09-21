import { defaultMutations } from '../../../src/index'
import config from '../config'

// MODULE: dex
const state = {
  pokemonById: {
    '*': {
      name: '',
      tags: {
        '*': true
      },
      powerUps: []
    }
  },
  emptyObject: {},
  propToBeDeleted: true
}

export const dex = {
  namespaced: true,
  state: state,
  mutations: defaultMutations(state, config, {moduleNamespace: 'dex/'})
}

export const firestoreDex = {
  // firestore settings
  firestorePath: 'fakePath',
  firestoreRefType: 'collection',
  moduleName: 'dexDB',
  statePropName: 'pokemonById',
  // the rest
  namespaced: true,
  state: state,
  mutations: defaultMutations(state, config, {moduleNamespace: 'dexDB/'})
}
