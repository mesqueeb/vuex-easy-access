import { defaultMutations } from '../../../src/index'
import config from '../config'
// MODULE: dex

const state = {
  '*': {
    name: '',
    online: false,
    tags: {
      '*': true
    }
  }
}

export const friendsList = {
  namespaced: true,
  state: state,
  mutations: defaultMutations(state, config, {moduleNamespace: 'friendsList/'})
}
