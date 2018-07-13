import { defaultMutations } from '../../../src/index'
import config from '../config'

// MODULE: user
const userState = {
  user: {secretProp: []},
  importedData: [],
  wallet: []
}
const user = {
  namespaced: true,
  state: userState,
  mutations: defaultMutations(userState, config, {moduleNamespace: 'user/'})
}

export default user
