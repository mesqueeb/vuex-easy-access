import { createApp } from 'vue'
import { createStore } from 'vuex'
import storeObj from './store'

const app = createApp({})
const store = createStore(storeObj)
app.use(store)
// console.log('store.set → ', store.set)
// console.log('store.get → ', store.get)
export default store
