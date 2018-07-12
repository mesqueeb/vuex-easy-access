import { defaultMutations } from '../../../src/index'
import config from '../config'

// MODULE: user
const userState = {
  user: {secretProp: null},
  importedData: [],
  wallet: 0
}
const user = {
  namespaced: true,
  state: userState,
  mutations: defaultMutations(userState, config)
}

export default user
