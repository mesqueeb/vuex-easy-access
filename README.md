# Vuex Easy Access

The Vuex Easy Access plugin does two things:
1. Add a global getter/setter for each state property
2. Automatically generate mutations for each state property

## Overview

### 👎😓 Traditional vuex -- bothersome to set up

- | Getter | Setter
--|--|--
Usage in<br>Vue component | `$store.getters['user/pokemon']` | `$store.dispatch('user/setPokemon', newVal)`
Required<br>setup | <small>getters:</small><br>`'pokemon': (state, getters) => { return state.pokemon }` | <small>actions:</small><br>`'setPokemon: ({commit}, newVal) => { commit('SET_POKEMON', newVal) }'`<br><small>mutations:</small><br>`'SET_POKEMON: (state, newVal) => { state.pokemon = newVal }'`
Overwrite<br>Getter/Setter | Change the above to something else | Change the above to something else

### 👍😀 Vuex Easy Access -- 0 set up!

- | Getter | Setter
--|--|--
Usage in<br>Vue component | `$store.get('user/pokemon')` | `$store.set('user/pokemon', newVal)`
Required<br>Setup | **No setup**<br><small>returns `state.user.pokemon` by default</small> | **No setup**<br><small>updates `state.user.pokemon` through a mutation by default</small>
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

To keep everything fun we're gonna explain things with the example of a Pokémon app. 🐞

First have our "character" with one primary Pokémon:

- module: `character/`<br>
- state: `{party: {primary: 'bulbasaur'}}`

Now we need a page with an option to swap the primary Pokémon:

```html
<template>
  Primary Pokémon: {{ $store.get('character/party.primary') }}
  <button @click="$store.set('character/party.primary', 'squirtle')">Swap for Squirtle!</button>
</template>
```

Nothing required inside your Vue component methods! Very clean! 🏄🏼‍

#### Use case: set in vuex module

Besides `set()` on the store object, there is also a special setter created for each prop as an action you can dispatch!

Your module `character/` will automatically receive a sub-module called `character/set/`! In this sub-module the actions are created to set each of the props of `character/`.

This makes it possible for you to do:

```js
// in the `character/` module
actions: {
  randomizePrimaryPokemon ({dispatch}) {
    dispatch('set/party.primary', random())
  }
}
```

The sub-module `set/` with the action `primary` are automatically created and commit to your store!

Please note: This requires your modules to be namespaced to work properly!

#### Use case: set with ID wildcard

I also got you covered when you need to set a property with an ID. Let's say there's an empty PokéDEX that gets information assigned as your character progresses!

- module: `pokeDex/`<br>
- state: `{byId: {}}`

In this case our PokéDEX is an empty object when the store initialises. Whenever the player captures a Pokémon you can add that Pokémon to his PokéDEX by ID by ending the setter path with an asterisk:

```js
const newPokemon = {id: '151', name: 'mew', captured: true}
// in Vue components
$store.set('pokeDex/byId.*', newPokemon)
// in the Vuex store
dispatch('pokeDex/set/byId.*', newPokemon)

// your `pokeDex/` state will update to:
state: {
  byId: {
    '151': {id: '151', name: 'mew', captured: true}
  }
}
```

### Overwriting get/set with custom logic

#### Overwrite get

Say that we want to make the first letter of our primary Pokémon always show up with a capital letter. For this we can overwrite the default `get('character/party.primary')` getter like so:

```js
// in the `character/` module
getters: {
  // create a getter with the prop name you want to overwrite:
  'party.primary': (state) => {
    const name = state.party.primary
    // capitalise first letter:
    return name[0].toUpperCase() + name.substring(1)
  }
}
```

Now automatically in your whole app where you used `get('character/party.primary')` it will return the Pokémon name with a first capital letter!

The `get()` method of Vuex Easy Access first checks if a getter with the syntax like above exists. If it does it will return the getter, if not it will just return the state property: `state.character.party.primary`.

#### Overwrite set

Say we want a side effect to our setter. Instead of creating a new setter and changing all our Vue components, we can easily overwrite the default `set()` action to do extra stuff.

Let's notify the user each time the primary Pokémon was changed:

```js
// in the `character/` module
actions: {
  // create an action with the prop name you want to overwrite:
  'party.primary': ({commit, dispatch}, newPokemon) => {
    dispatch('notify', 'Primary Pokémon changed!', {root: true})
    // do not forget to commit manually when overwriting the setter:
    return commit('party.primary', newPokemon)
  }
}
```

The `set()` method of Vuex Easy Access checks to see if an action with the same path exist. If it exists it will dispatch this action, if not it will just make a default mutation: `commit('character/party.primary', newPokemon)`.

**Firebase API**:<br>
In cases you want to sync your vuex store automatically with Firebase's Firestore see [chapter 3](#3-advanced-configuration).

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

Vuex Easy Access will automatically generate a mutation **per state prop**!

- module: `character/`<br>
- state: `{party: {primary: 'bulbasaur'}}`

This gives you these mutations:

```js
commit('character/party', newParty)
commit('character/party.primary', newPokemon)
```

And Vuex Easy Access does all this in just 2 lines. Say goodbye to boilerplating. Don't let it be a roadblock in order to do best practices!

*Side note on the traditional `SET_PROP` syntax:*<br>You can also opt in for the mutations to be in the traditional syntax (as per the vuex documentation). For this please read [Setter patterns](#-setter-patterns) down below.

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

Yes, yes, I know. The fun just doesn't end. We also have them array mutations set for you!

Say you have a Pokémon box saved as array:<br>`state: {pokemonBox: []}`<br>
When you add an empty array to the initial state, you will get 4 extra mutations, so it will be possible to do these:

```js
// add a pokemon:
commit('pokemonBox.push', newPokemon)
// don't need that last pokemon anymore:
commit('pokemonBox.pop')
// don't need that first pokemon anymore:
commit('pokemonBox.shift')
// change your first pokemon for a new one
commit('pokemonBox.splice', [0, 1, newPokemon])
```

All these mutations are set up for you, automatically. You only need to write your state.

Please note that the second parameter of 'splice' has to be an array with the 3 arguments just like the regular splice method.

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

If for some reason you want to change the default function names for `get()` and `set()` to something else (eg. capitalising to `GET()` and `SET()`), you can do so by passing an object to `createEasyAccess()` like so:

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

You can choose two setups for mutation/setter syntax: `simple` (default) or `traditional`. This will affect how you make commits or overwrite them!

Let's take this example state: <br>`pokemonBox: { water: [] }`

When you want to **overwrite the setter actions**:

```js
// 'simple' uses just the property name:
'pokemonBox.water': ({commit}, newVal) => {
  // do something extra
  commit('pokemonBox.water', newVal) // you have to commit when overwriting
}

// 'traditional' uses 'set' in front of actions and 'SET_' in front of mutations:
'setPokemonBox.water': ({commit}, newVal) => {
  // do something extra
  commit('SET_POKEMONBOX.WATER', newVal) // you have to commit when overwriting
}
```

And the underlying mutations it will use:

```js
// 'simple' (default):
commit('pokemonBox', newVal)
commit('pokemonBox.water', newVal)
commit('pokemonBox.water.push', newVal)
commit('pokemonBox.water.pop', newVal)
commit('pokemonBox.water.shift', newVal)
commit('pokemonBox.water.splice', newVal)
// 'traditional':
commit('SET_POKEMONBOX', newVal)
commit('SET_POKEMONBOX.WATER', newVal)
commit('PUSH_POKEMONBOX.WATER', newVal)
commit('POP_POKEMONBOX.WATER', newVal)
commit('SHIFT_POKEMONBOX.WATER', newVal)
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
- Improve error handling
  - Explain to dev possible path mistakes ` / vs . ` when no mutation is found
  - Warn about ignoredProps appearing in two modules
  - Warn when there is a module called 'set'
  - Warn when there already is a 'set' prop on the store

Also be sure to check out the sister vuex-plugin for Firebase: [Vuex Easy Firestore](https://github.com/mesqueeb/VuexEasyFirestore)!

--

Happy Vuexing!<br>
-Luca Ban
