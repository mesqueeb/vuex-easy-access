
import { defaultMutations } from '../dist/index'

let initialState = function () {
  return {
    stateValue: null
  }
}

let res = defaultMutations(initialState())
// res