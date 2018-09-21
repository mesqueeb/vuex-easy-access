# Advanced configuration

When you create your easyAccess plugin, you can make some configuration through an object:

```js
import createEasyAccess from 'vuex-easy-access'
const easyAccess = createEasyAccess({/* your configuration */})
```

All possible values for the configuration are explained here:

## Firestore integration (for Google Firebase)

You can add compatibility for the amazing sister plugin: [Vuex Easy Firestore](https://github.com/mesqueeb/VuexEasyFirestore). To do so just pass a variable in the configuration object like so:

```js
const easyAccess = createEasyAccess({vuexEasyFirestore: true})
```

This will make sure that whenever you set a value in a module where you enabled 'Vuex Easy Firestore', it will **auto-sync to your firestore**! Please see the [Vuex Easy Firestore documentation](https://github.com/mesqueeb/VuexEasyFirestore) for more information on how to set up auto-sync with firestore.

Please note when using both plugins, it is important to pass the 'vuex-easy-firestore' plugin first, and the 'easyAccess' second for it to work properly.

## Change get() set() function names

If for some reason you want to change the default function names for `get()` and `set()` (or `delete()`) to something else (eg. capitalising to `GET()` and `SET()`), you can do so by passing an object to `createEasyAccess()` like so:

```js
const easyAccess = createEasyAccess({
  getter: 'GET',
  setter: 'SET',
  deletor: 'DELETE', // See 'Use case: set with ID wildcard'
})
```

Now instead of the `get` `set` keywords, you will only be able to use `store.GET()` and `store.SET()` and for dispatches `dispatch('SET/prop', val)`.

## Ignore private state props

Vuex Easy Access will ignore (and not make mutations/setters) any props that:

- start with an underscore (*default*)
- are added to the `ignoreProps: []` config

```js
// in the config
const easyAccess = createEasyAccess({
  ignoreProps: ['normalProp.secretProp'] // true is the default
})
const state = {
  _privateProp: null, // this prop is not touched at all!
  normalProp: {
    secretProp: null // this prop is not touched at all!
  }
}
const store = {
  state,
  mutations: {
    // and in the defaultMutations
    ...defaultMutations(state, {
      ignoreProps: ['normalProp.secretProp']
    })
  },
}
```

This will create only the mutation and dispatch setter for 'normalProp':

- `mutate('normalProp', newVal)`
- `dispatch('set/normalProp', newVal)`

And none will be set for '_privateProp' and 'secretProp'!

To disable ignoring the ones with an underscore (`_privateProp`) you need to do:

```js
// in the config
const easyAccess = createEasyAccess({
  ignorePrivateProps: false, // true is the default
})
// and in your modules:
mutations: {
  ...defaultMutations(state, {ignorePrivateProps: false})
}
```

Please note that when passing a prop to `ignoreProps` it will be ignored in all modules regardless of the module namespace. This is because 'defaultMutations' doesn't know the exact namespace of the module when it's initiated. You can be specific about the prop to ignore in just the namespace you want by passing the 'moduleNamespace' as third prop to the 'defaultMutations'. See the example below:

```js
// We will use the prop ignoreMeInUser in both the store root and the user module
// But we will only ignore it in user
const config = { ignoreProps: ['user/ignoreMeInUser'] }
const easyAccess = createEasyAccess(config) // add config
const rootAndUserState = { ignoreMeInUser: null }
const userModule = {
  state: rootAndUserState,
  mutations: defaultMutations(rootAndUserState, config, {moduleNamespace: 'user/'}) // add config and moduleNamespace
}
const store = {
  modules: { user: userModule },
  state: rootAndUserState,
  mutations: defaultMutations(rootAndUserState, config, {moduleNamespace: ''}) // add config and moduleNamespace
}
```

## Use traditional `SET_PROP` syntax

Mutations are used under the hood. These mutations have a simple syntax which is just the name of the prop. Check the [Reference](reference.html) for a quick overview of the mutations used by Vuex Easy Firestore.

You can also opt in for mutations to be in **the traditional syntax** (as per the vuex documentation). For this please read [Syntax for overwriting setters](hooks.html#hook-into-set) in the Hooks chapter.

### Missing any features?

If you have any requests for more customisation of this functionality, please let me know in an [issue](https://github.com/mesqueeb/vuex-easy-access/issues)!
