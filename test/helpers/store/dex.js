import { defaultMutations } from '../../../src/index'
import config from '../config'

// MODULE: dex
const state = {
  pokemonById: {
    '*': {
      name: '',
      tags: {
        '*': true
      }
    }
  }
}

const dex = {
  namespaced: true,
  state: state,
  mutations: defaultMutations(state, config, {moduleNamespace: 'dex/'})
}

export default dex
