import Vue from 'vue'
import Vuex from 'vuex'
import storeObj from './store'

// create store
Vue.use(Vuex)
const store = new Vuex.Store(storeObj)
const a = store._mutations

export default store
