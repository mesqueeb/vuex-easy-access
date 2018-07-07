import createEasyAccess from '../dist/index.cjs.min'
import Vue from 'vue'
import Vuex from 'vuex'
import storeObj from './store'
import config from './config'
// set plugin
const easyAccess = createEasyAccess(config)
storeObj.plugins = [easyAccess]
// create store
Vue.use(Vuex)
const store = new Vuex.Store(storeObj)
const m = store._mutations
const m2 = Object.keys(m)
const a = store._actions
const modules = store._modulesNamespaceMap
console.log('a → ', a)
