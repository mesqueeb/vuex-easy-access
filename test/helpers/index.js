import Vue from 'vue'
import Vuex from 'vuex'
import storeObj from './store'

// create store
Vue.use(Vuex)
const store = new Vuex.Store(storeObj)
// console.log('store.set → ', store.set)
// console.log('store.get → ', store.get)
export default store
