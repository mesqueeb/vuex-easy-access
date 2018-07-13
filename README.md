# Vuex Easy Access

The Vuex Easy Access plugin does two things:
1. Add a global getter/setter for each state property
2. Automatically generate mutations for each state property

## Overview

### 👎😓 Traditional vuex: bothersome to set up

- | Getter | Setter
--|--|--
Usage in<br>Vue component | `$store.getters['user/pokemon']` | `$store.dispatch('user/setPokemon', newVal)`
Required<br>setup | <small>getters:</small><br>`'pokemon': (state, getters) => { return state.pokemon }` | <small>actions:</small><br>`'setPokemon: ({commit}, newVal) => { commit('SET_POKEMON', newVal) }'`<br><small>mutations:</small><br>`'SET_POKEMON: (state, newVal) => { state.pokemon = newVal }'`
Overwrite<br>Getter/Setter | Change the above to something else | Change the above to something else

### 👍😀 Vuex Easy Access: 0 set up!

- | Getter | Setter
--|--|--
Usage in<br>Vue component | `$store.get('user/pokemon')` | `$store.set('user/pokemon', newVal)`
Required<br>Setup | No setup<br><small>returns `state.user.pokemon` by default</small> | No setup<br><small>updates `state.user.pokemon` through a mutation by default</small>
Overwrite<br>default | <small>getters:</small><br>`'pokemon': () => { return state.pokemon }` | <small>actions:</small><br>`'pokemon: ({commit}, newVal) => { commit('pokemon', newVal) }'`

### Table of contents

<!-- TOC -->

- [Motivation](#motivation)
- [Installation](#installation)
- [1. Add a global getter/setter for each state property](#1-add-a-global-gettersetter-for-each-state-property)
    - [What you can do](#what-you-can-do)
    - [Overwriting get/set with custom logic](#overwriting-getset-with-custom-logic)
    - [Usage](#usage)
- [2. Automatically generate mutations for each state property](#2-automatically-generate-mutations-for-each-state-property)
    - [What's all this then?](#whats-all-this-then)
    - [Usage](#usage-1)
    - [Bonus: Array mutations!](#bonus-array-mutations)
- [3. Advanced configuration](#3-advanced-configuration)
    - [Vuex Easy Firestore integration for Google firebase](#vuex-easy-firestore-integration-for-google-firebase)
    - [get() set() function names](#get-set-function-names)
    - [Ignore private state props](#ignore-private-state-props)
    - [Setter patterns](#setter-patterns)
- [Feedback](#feedback)

<!-- /TOC -->

## Motivation

There are several vuex plugins available making boilerplating etc easier for you. I felt most of them are overkill and wanted something small and simple.

## Installation

```
npm i --save vuex-easy-access
```

## 1. Add a global getter/setter for each state property

### What you can do

As you can see in the [overview](#overview), you can access and set anything in your store through `get()` and `set()` methods:

- `get(path)` will automatically look for a getter, if none it will return the state
- `set(path, val)` will automatically look for an action, if none it will make a mutation

The `path` syntax is: `module/submodule/stateVal.subProp`.<br>
`/` for modules and `.` for sub properties when the state value is an object.

The get() and set() syntax is streamlined and easy to use! (unlike vuex's default syntax mess)

#### Use case: get/set in vue component

You have an app where users have themes and can set colors per theme.<br>
The module path is: `user/theme`<br>
`state: {colors: {primary: 'blue', secondary: 'white'}}`

```html
<template>
  Primary color: {{ $store.get('user/theme/colors.primary') }}
  <button @click="$store.set('user/theme/colors.primary', 'red')">Make primary red</button>
</template>
```

Nothing required inside your component methods! Very clean! 🏄🏼‍♂️

#### Use case: set in vuex module

For each property in each module a separate setter is created as a submodule for that module: `user/theme` will have a submodule `user/theme/set` with each state prop from `user/theme` as the identifier of the setter action.

Eg. inside the `user/theme` module you could add the following action:

```js
actions: {
  randomizeTheme ({dispatch}) {
    dispatch('set/colors.primary', random())
    dispatch('set/colors.secondary', random())
    // these refer the submodule 'set' and action name 'colors.primary'
    // these actions get added automatically by vuex-easy-access
  }
}
```

Please note: This requires your modules to be namespaced to work properly!

### Overwriting get/set with custom logic

#### Overwrite get

Say that in the future we want to make sure when we get the primary color it will translate to a readable color name. For this let's set up a getter:

```js
// in the user/theme module
getters: {
  'colors.primary': (state) => {
    return hexToReadableColor(state.colors.primary)
  }
}
```

Now automatically in your whole app where you used `get('user/theme/colors.primary')` it will start using this getter instead!

The `get()` method of Vuex Easy Access first checks if a getter with the syntax like above exists. If it does it will return the getter, if not it will just return the state property: `state.user.theme.colors.primary`.

#### Overwrite set

Now we want to make an api call to the server every time the user updates this value. We would want to set up an action in our same module:

```js
// in the user/theme module
actions: {
  'colors.primary': ({state, commit, dispatch}, newColor) => {
    dispatch('patchToServer', state.colors.primary, {root: true})
    // do not forget to commit manually when overwriting the setter:
    return commit('colors.primary', newColor)
  }
}
```

Now inside your entire app, whenever `set('user/theme/colors.primary')` is called, the action above will be triggered and the color is synced to the server.

The `set()` method of Vuex Easy Access checks to see if an action with the same path exist. If it exists it will dispatch this action, if not it will just make a default mutation: `commit('user/theme/colors.primary', newColor)`.

However, if the mutation does not exist it will give an error and tell you how to add the mutation in the console. But luckily, you can also add all mutations for each single state prop **automatically**. See [chapter 2](#2-automatically-generate-mutations-for-each-state-property) how to set up.

**Firebase API**:<br>
In cases you want to sync your vuex store with Firebase's Firestore see [chapter 3](#3-advanced-configuration).

### Usage

```js
import createEasyAccess from 'vuex-easy-access'
// do the magic 🧙🏻‍♂️
const easyAccess = createEasyAccess()
// and include as plugin in your vuex store:
store: {
  // ... your store
  plugins: [easyAccess]
}
```

That's it!! Simple and clean. ♫

## 2. Automatically generate mutations for each state property

### What's all this then?

Since a vuex store is really easy to debug based on the commit history, it's best practice to have one single mutation for each property in the store.

But do you know the pain of setting up one single mutation for each single state property in your store? No more!

Vuex Easy Access creates one mutation for every single property in your store! All AUTOMATICALLY!

#### What really happens?

In line with the examples above:<br>
The module path is: `user/theme`<br>
`state: {colors: {primary: 'blue', secondary: 'white'}}`

Vuex Easy Access will then automatically generate these mutations for you to use:

```js
commit('user/theme/colors', newValue)
commit('user/theme/colors.primary', newValue)
commit('user/theme/colors.secondary', newValue)
```

And Vuex Easy Access does all this in just 2 lines. Say goodbye to boilerplating. Don't let it be a roadblock in order to do best practices!

`SET_PROP` syntax: You can also opt in for the mutations to be in the traditional syntax (as per the vuex documentation). For this please read [Setter patterns](#-setter-patterns) down below.

### Usage

```js
import { defaultMutations } from 'vuex-easy-access'
// in the root or a module's mutations:
mutations: {
  // your other mutations
  ...defaultMutations(state)
    // pass your state object
}
```

### Bonus: Array mutations!

Yes, yes, I know. The fun just doesn't end. We also have them array mutations set for you!<br>
`state: {pokemon: []}`
Will become:

```js
// you caught a new pokemon:
commit('pokemon.push', newPokemon)
// you don't need that last pokemon anymore:
commit('pokemon.pop')
// you change your first pokemon for a new one
commit('pokemon.splice', [0, 1, newPokemon])
```

All these mutations are set up for you, automatically. You only need to write your state. Please note that the second parameter of 'splice' has to be an array with the 3 arguments just like the regular splice method.

## 3. Advanced configuration

When you create your easyAccess plugin, you can make some configuration through an object:

```js
import createEasyAccess from 'vuex-easy-access'
const easyAccess = createEasyAccess({/* your configuration */})
```

All possible values for the configuration are explained here:

### Vuex Easy Firestore integration for Google firebase

You can add compatibility for the amazing sister plugin: [Vuex Easy Firestore](https://github.com/mesqueeb/VuexEasyFirestore). To do so just pass a variable in the configuration object like so:

```js
const easyAccess = createEasyAccess({vuexEasyFirestore: true})
```

This will make sure that whenever you set a value in a module that's auto-synced to firestore through Vuex Easy Firestore, it will trigger the sync properly. Please see the [Vuex Easy Firestore documentation](https://github.com/mesqueeb/VuexEasyFirestore) for more information on how to set up auto-sync with firestore.

Vuex Easy Firestore comes with a special setter for adding items to your module ánd database. However, it is important to pass the 'vuex-easy-firestore' plugin first, and the 'easyAccess' second for it to work properly.

### get() set() function names

If for some reason you want to change the default function names for `store.get()` and `store.set()`, you can do so by passing an object to `createEasyAccess()` like so:

```js
const easyAccess = createEasyAccess({
  getter: 'GET',
  setter: 'SET'
})
```

Now instead of the `get` `set` keywords, you will only be able to use `store.GET()` and `store.SET()` and for dispatches `dispatch('SET/prop', val)`.

### Ignore private state props

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

If you have any requests for more customisation of this functionality, please let me know in an issue!

### Setter patterns

```js
state: {
  pokemonBox: {
    water: []
  },
}
// This state will give these setters:
// From vue component:
$store.set('pokemonBox/water', newVal)
// From vuex store:
dispatch('set/pokemonBox/water', newVal)
```

You can choose two setups for mutation syntax: `simple` (default) or `traditional`.

This matters when you want to **overwrite the setter actions**:

```js
// 'simple' uses just the property name:
actions: {
  'pokemonBox.water': ({commit}, newVal) => {
    // do something extra
    commit('pokemonBox.water', newVal) // you have to commit when overwriting
  }
}
// 'traditional' uses 'set' in front of actions and 'SET_' in front of mutations:
actions: {
  'setPokemonBox.water': ({commit}, newVal) => {
    // do something extra
    commit('SET_POKEMONBOX.WATER', newVal) // you have to commit when overwriting
  }
}
```

And the underlying mutations it uses:

```js
// 'simple' (default):
commit('pokemon', newVal)
commit('pokemonBox.water', newVal)
commit('pokemonBox.water.push', newVal)
commit('pokemonBox.water.pop', newVal)
commit('pokemonBox.water.splice', newVal)
// 'traditional':
commit('SET_POKEMONBOX', newVal)
commit('SET_POKEMONBOX.WATER', newVal)
commit('PUSH_POKEMONBOX.WATER', newVal)
commit('POP_POKEMONBOX.WATER', newVal)
commit('SPLICE_POKEMONBOX.WATER', newVal)
```

You can choose your preferred pattern like this:

```js
const easyAccess = createEasyAccess({
  pattern: 'traditional', // or 'simple'
})
// and in your modules:
mutations: {
  ...defaultMutations(state, {pattern: 'traditional'}) // or 'simple'
}
```

(Do not use conflicting choises in the plugin settings and the defaultMutations)

## Feedback

Do you have questions, comments, suggestions or feedback? Or any feature that's missing that you'd love to have? Feel free to open an issue! ♥

Planned future features:

- Make a blog post
- Improve setting nested props of items with ID's
  - Maybe something like `set('items/${id}.field', newVal)`
- Improve error handling
  - Explain to developer possible path mistakes: ` / vs . `

Also be sure to check out the sister vuex-plugin for Firebase: [Vuex Easy Firestore](https://github.com/mesqueeb/VuexEasyFirestore)!

--

Happy Vuexing!<br>
-Luca Ban
