# Vuex Easy Access

The Vuex Easy Access plugin gives you two things:

1. Easy to use `get() set()` for any state property!
2. Automatically generate `actions` and `mutations` for each state property!<br>→ Extra support for arrays, wildcard setters etc!

## Overview

### 👎😓 Traditional vuex -- bothersome to set up

Full manual setup required:

```js
// Module: `user`
state: {
  pokemon: {},
  items: []
}
getters: {
  pokemon: (state, getters) => { return state.pokemon }
  items: (state, getters) => { return state.items }
}
actions: {
  setPokemon: ({commit}, pokemon) => { commit('SET_POKEMON', pokemon) }
  addItem: ({commit}, item) => { commit('PUSH_ITEM', item) }
}
mutations: {
  SET_POKEMON: (state, pokemon) => { state.pokemon = pokemon }
  PUSH_ITEM: (state, item) => { state.items.push(item) }
}
```

Especially setting up specific actions/mutations for working with arrays, items with ID's (wildcards paths), deletion of props etc. can be extremely tedious!

### 👍😀 Vuex Easy Access -- 0 set up!

Enter vuex-easy-access! Easy to use actions & mutations with 0 set up required!<br>
　　Everything below is auto-generated! 🎉

### In Vue components: `get() set()` functions on `$store` object

|||
--|--
Getter | `$store.get('user/pokemon')`
Setter | `$store.set('user/pokemon', pokemon)`<br><small>Will use a mutation</small>
Sub-props<br><small>Use `.` between props</small> | `$store.set('user/prop.subProp', newVal)`
Overwriting defaults | You can overwrite the getter by adding a `pokemon` getter.<br>And the setter by adding a `pokemon` action.<br>In case of the action you need to execute the `mutation` manually (see below).

### In the Vuex store: auto generated actions & mutations!

|||
--|--
Actions<br><small>Auto-generated<br>sub-module</small> | `dispatch('user/set/pokemon', pokemon)`<br><small>With sub-prop:</small><br>`dispatch('user/set/prop.subProp', newVal)`<br><small>Special for arrays:</small><br>`dispatch('user/set/items.push', item)`<br>`dispatch('user/set/items.shift')`<br>`dispatch('user/set/items.pop')`<br>`dispatch('user/set/items.splice', [0, 1, item])`
Mutations<br><small>Used by actions<br>behind the scenes</small> | `commit('user/pokemon', pokemon)`<br>`commit('user/prop.subProp', newVal)`<br>`commit('user/items.push', item)`<br>`commit('user/items.shift')`<br>`commit('user/items.pop')`<br>`commit('user/items.splice', [0, 1, item])`
Overwriting defaults | Even when you use `dispatch(set/something, val)` everywhere in your store,<br>the moment you add an action called `something: () => {}`,<br>`dispatch(set/something, val)` will automatically execute that one instead!

### Easy working with wildcards! 🃏

Just add `'*'` as prop in your state and you will have super powers 💪🏻!

```js
state = {
  pokeDex: {
    '*': {name: '', seen: false, tags: {'*': false}}
    // '*' indicates that pokeDex will have items with ID's
    // `name` and `seen` and `tags` will be default values for items added
  }
}
```

Let's add Bulbasaur to our PokéDex:

- Bulbasaur is to be added at `pokeDex['001']`
- Bulbasaur will have `seen: false` as **default prop**!
- Below is the method to insert Bulbasaur:

_ | in Vue components
--|--
Insert / overwrite<br>wildcard object | 1) Set an object with a `{[id]: value}` pair to `'*'`:<br>`$store.set('pokeDex.*', {'001': {name: 'Bulbasaur'}})`<br><br>2) **Or** set an object with an `id` field to `'*'`:<br>`$store.set('pokeDex.*', {id: '001', name: 'Bulbasaur'})`
Overwrite single values | Arrays for wildcards in mid path:<br>`seen` of Pokemon with id `'001'` will be set to `true`:<br>`store.set('pokeDex.*.seen', ['001', true])`
Delete with id | Only pass `id`:<br>`$store.delete('pokeDex.*', '001')`
Multiple wildcards | Must pass array, where first value is first id:<br>`$store.set('pokeDex.*.tags.*', ['001', {fire: true}])`<br>`$store.delete('pokeDex.*.tags.*', ['001', 'fire'])`


_ | in the Vuex store:<br><small>Almost same as above</small>
--|--
Vue component<br><br><br>Vuex store<br><br><br>Underlying mutations | `$store.set('pokeDex.*', newPokemon)`<br>`$store.delete('pokeDex.*', '001')`<br>becomes:<br>`dispatch('set/pokeDex.*', newPokemon)`<br>`dispatch('delete/pokeDex.*', '001')`<br>which uses:<br>`commit('pokeDex.*', newPokemon)`<br>`commit('-pokeDex.*', '001')`

## Table of contents

<!-- TOC -->

- [Overview](#overview)
- [Table of contents](#table-of-contents)
- [Motivation](#motivation)
- [Installation](#installation)
- [Setup](#setup)
- [1. Overview of all automatically generated setters / actions / mutations](#1-overview-of-all-automatically-generated-setters--actions--mutations)
- [2. Add a global getter/setter for each state property](#2-add-a-global-gettersetter-for-each-state-property)
    - [get() set() in Vue components](#get-set-in-vue-components)
    - [set() in the Vuex store](#set-in-the-vuex-store)
    - [Set items with an ID wildcard](#set-items-with-an-id-wildcard)
    - [Overwriting default get()](#overwriting-default-get)
    - [Overwriting default set()](#overwriting-default-set)
- [3. Advanced configuration](#3-advanced-configuration)
    - [Vuex Easy Firestore integration for Google firebase](#vuex-easy-firestore-integration-for-google-firebase)
    - [Change get() set() function names](#change-get-set-function-names)
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

## Setup

Add as vuex store plugin

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

Add as per module in the mutations

```js
import { defaultMutations } from 'vuex-easy-access'
// in the root or a module's mutations:
mutations: {
  // your other mutations
  ...defaultMutations(state)
    // pass your state object
}
```

That's it!! Simple and clean. ♫

## 1. Overview of all automatically generated setters / actions / mutations

Vuex Easy Access creates one setter / action / mutation for every single property in your store! All AUTOMATICALLY!

Here is the overview of an example store and everything that will be auto generated:

```js
// Module: `character/`
state: {
  party: {
    primary: ''
  },
  pokeBox: [],
  pokeDex: {
    '*': {
      name: '',
      seen: false,
      types: { '*': false }
    }
  },
}

// Setters you can use from Vue components
$store.set('character/party', newParty) // modules end in `/`
$store.set('character/party.primary', newPokemon) // separate sub-props with `.`
// arrays
$store.set('character/pokeBox.push', newPokemon)
$store.set('character/pokeBox.pop')
$store.set('character/pokeBox.shift')
$store.set('character/pokeBox.splice', [0, 1, newPokemon]) // second argument is an array
// wildcards
$store.set('character/pokeDex.*', {'001': {name: 'Bulbasaur'}}) // {[id]: item} → preffered way to insert items
// or
$store.set('character/pokeDex.*', {id: '001', name: 'Bulbasaur'}) // object with an `id` field. Full object will be added as the item.
$store.set('character/pokeDex.*.types.*', [id, {'water': true}]) // with 2 wildcards add and array. First id first, second id will be 'water'
$store.set('character/pokeDex.*.seen', [id, true]) // Array with first the wildcard `id` then the value you want to set to `seen` in this case
$store.delete('character/pokeDex.*', id) // needs `id` field

// Actions you can use (from `set/` sub-module)
dispatch('character/set/party', newParty)
dispatch('character/set/party.primary', newPokemon)
dispatch('character/set/pokeBox.push', newPokemon)
dispatch('character/set/pokeBox.pop')
dispatch('character/set/pokeBox.shift')
dispatch('character/set/pokeBox.splice', [0, 1, newPokemon])
dispatch('character/set/pokeDex.*', newPokemon) // see insert method above
dispatch('character/set/pokeDex.*types.*', [id, {'water': true}])
dispatch('character/set/pokeDex.*.seen', [id, true])
dispatch('character/delete/pokeDex.*', id) // from `delete/` sub-module

// Mutations you can use
commit('character/party', newParty)
commit('character/party.primary', newPokemon)
commit('character/pokeBox.push', newPokemon)
commit('character/pokeBox.pop')
commit('character/pokeBox.shift')
commit('character/pokeBox.splice', [0, 1, newPokemon])
commit('character/pokeDex.*', newPokemon) // see insert method above
commit('character/pokeDex.*.seen', [id, true])
commit('character/-pokeDex.*', id) // with `-` in front

// Getters you can use
$store.get('any/path/as.seen.above')
```

And Vuex Easy Access does all this in just 2 lines... All you have to do is write your state! That's it!<br>Say goodbye to boilerplating. Don't let it be a roadblock in order to do best practices!

*Side note on the traditional `SET_PROP` syntax:*<br>You can also opt in for the mutations to be in the traditional syntax (as per the vuex documentation). For this please read [Setter patterns](#-setter-patterns) down below.

## 2. Add a global getter/setter for each state property

As you can see in the [overview](#overview), you can access and set anything in your store through `get()` and `set()` methods:

- `get(path)` will automatically look for a getter, if none it will return the state
- `set(path, val)` will automatically look for an action, if none it will make a mutation

The `path` syntax is: `module/submodule/stateVal.subProp`.<br>
`/` for modules and `.` for sub properties when the state value is an object.

The get() and set() syntax is streamlined and easy to use! (unlike vuex's default syntax mess)

### get() set() in Vue components

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

### set() in the Vuex store

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

### Set items with an ID wildcard

I also got you covered when you need to set a property with an ID. Let's say there's an empty PokéDEX that gets information assigned as your character progresses! We need methods to quickly add new Pokémon to our PokéDEX!<br>Welcome to vuex-easy-access wildcard paths!

```js
// Module: `pokeDex/`
state: {
  byId: {
    '*': {captured: true}
    // '*' indicates this will receive wildcard paths '*'.
    // And anything written as value of the '*' prop will become the default values of objects inserted through wildcard paths.
  }
}
```

The setup above makes it possible to **very easy** add objects with a specific ID.<br>Let's look at all the things you can do:

```js
// the player captured Mew!
const newPokemon = {id: '151', name: 'mew'}

// You can easily add it to the pokeDex with:
// in Vue components
  $store.set('pokeDex/byId.*', newPokemon)
// in the Vuex store
  dispatch('pokeDex/set/byId.*', newPokemon)

// Now your `pokeDex.state` will update to:
  byId: {
    '151': {id: '151', name: 'mew', captured: true}
    // Captured is a default value which was set up in the state above
  }

// We can also easily delete it again:
// in Vue components
  $store.delete('pokeDex/byId.*', '151') // pass just the id
// in the Vuex store
  dispatch('pokeDex/delete/byId.*', '151')
```

### Overwriting default get()

Say that we want to make the first letter of our primary Pokémon always show up with a capital letter. For this we can overwrite the default `get('character/party.primary')` getter like so:

```js
// Module: `character/`
state: { party: { primary: 'mewtwo' } },
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

### Overwriting default set()

Say we want a side effect to our setter. Instead of creating a new setter and changing all our Vue components, we can easily overwrite the default `set()` action to do extra stuff.

Let's notify the user each time the primary Pokémon was changed:

```js
// Module: `character/`
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

This will make sure that whenever you set a value in a module where you enabled 'Vuex Easy Firestore', it will **auto-sync to your firestore**! Please see the [Vuex Easy Firestore documentation](https://github.com/mesqueeb/VuexEasyFirestore) for more information on how to set up auto-sync with firestore.

Please note when using both plugins, it is important to pass the 'vuex-easy-firestore' plugin first, and the 'easyAccess' second for it to work properly.

### Change get() set() function names

If for some reason you want to change the default function names for `get()` and `set()` (or `delete()`) to something else (eg. capitalising to `GET()` and `SET()`), you can do so by passing an object to `createEasyAccess()` like so:

```js
const easyAccess = createEasyAccess({
  getter: 'GET',
  setter: 'SET',
  deletor: 'DELETE', // See 'Use case: set with ID wildcard'
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
