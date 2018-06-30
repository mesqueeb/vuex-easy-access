# Vuex Easy Access

The Vuex Easy Access plugin does two things:
1. Add a global getter/setter for each state property
2. Automatically generate mutations for each state property

<!-- Todo -->
<!-- 1. Make it so it doesn't matter if the user uses `/` or `.` -->

### Table of contents

<!-- TOC -->

- [Motivation](#motivation)
- [Installation](#installation)
- [1. Add a global getter/setter for each state property](#1-add-a-global-gettersetter-for-each-state-property)
    - [What you can do](#what-you-can-do)
    - [Why this is awesome](#why-this-is-awesome)
    - [Usage](#usage)
- [2. Automatically generate mutations for each state property](#2-automatically-generate-mutations-for-each-state-property)
    - [What's all this then?](#whats-all-this-then)
    - [Usage](#usage-1)
    - [Ignore certain state props](#ignore-certain-state-props)
    - [Bonus: Array mutations!](#bonus-array-mutations)
- [3. Advanced configuration](#3-advanced-configuration)
    - [Vuex Easy Firestore integration for Google firebase](#vuex-easy-firestore-integration-for-google-firebase)
    - [get() set() function names](#get-set-function-names)
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

You can access and set anything in your store through `get()` and `set()` methods:

- `get(path)` will automatically look for a getter, if none it will return the state
- `set(path, val)` will automatically look for an action, if none it will make a mutation

The `path` syntax is: `module/submodule/stateVal.subProp`.<br>
`/` for modules and `.` for sub properties when the state value is an object.

### Why this is awesome

In the example below we'll see why the `get()` and `set()` methods are helpful.

You have an app where users have themes and can set colors per theme.<br>
The module path is: `user/theme`<br>
`state: {colors: {primary: 'blue', secondary: 'white'}}`

Simple usage allows:

- Set primary color: `this.$store.set('user/theme/colors.primary', '#265EF6')`
- Get primary color: `this.$store.get('user/theme/colors.primary')`

First of all, we see a nice streamlined syntax to get and set values. (unlike vuex's default syntax mess)

#### Scenario 1
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

#### Scenario 2
Now we want to make an api call to the server every time the user updates this value. We would want to set up an action in our same module:

```js
// in the user/theme module
actions: {
  'setColors.primary': ({state, commit, dispatch}, newColor) => {
    dispatch('patchToServer', state.colors.primary, {root: true})
    return commit('SET_COLORS.PRIMARY', newColor)
  }
}
```

Now inside your entire app, whenever `set('user/theme/colors.primary')` is called, the action above will be triggered and the color is synced to the server.

The `set()` method of Vuex Easy Access checks to see if an action with the syntax `setProp` exist. If it exists it will dispatch this action, if not it will just make a default mutation: `commit('user/theme/SET_COLORS.PRIMARY', newColor)`. (Make sure you set up a mutation with the correct syntax above. To auto-generate mutations see [chapter 2](#2-automatically-generate-mutations-for-each-state-property).)

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

## 2. Automatically generate mutations for each state property

### What's all this then?

Since a vuex store is really easy to debug based on the commit history, it's best practice to have one single mutation for each property in the store.

But do you know the pain of setting up one single mutation for each single state property in your store? If you do, be rejoiced! (If you don't then you might be secretly mutating the store directly? That is not safe to try at home really...)

Vuex Easy Access creates one mutation for every single property in your store! All AUTOMATICALLY!

#### What really happens?

In line with the examples above:<br>
The module path is: `user/theme`<br>
`state: {colors: {primary: 'blue', secondary: 'white'}}`

Vuex Easy Access will then automatically generate these mutations:

```js
store.commit('user/theme/SET_COLORS', newValue)
store.commit('user/theme/SET_COLORS.PRIMARY', newValue)
store.commit('user/theme/SET_COLORS.SECONDARY', newValue)
```

And Vuex Easy Access does all this in just 2 lines. Say goodbye to boilerplating. Don't let it be a roadblock in order to do best practices!

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

### Ignore certain state props

Vuex Easy Access will ignore any props starting with an underscore.<br>
  eg. `state: {_privateProp: '...', normalProp: '...'}`

This will make sure that **only** the mutation for `normalProp` is generated: `mutate('SET_NORMALPROP')`

### Bonus: Array mutations!

Yes, yes, I know. The fun just doesn't end. We also have them array mutations set for you!<br>
`state: {pokemon: []}`
Will become:

```js
// you caught a new pokemon:
store.commit('PUSH_POKEMON', newPokemon)
// you don't need that last pokemon anymore:
store.commit('POP_POKEMON')
// you change your first pokemon for a new one
store.commit('SPLICE_POKEMON', 0, 1, newPokemon)
```

All these mutations are set up for you, automatically. You only need to write your state.

## 3. Advanced configuration

When you create your easyAccess plugin, you can make some configuration through an object:

```js
import createEasyAccess from 'vuex-easy-access'
const configuration = {/* your configuration */}
const easyAccess = createEasyAccess(configuration)
// and include as plugin in your vuex store:
store: {
  // ... your store
  plugins: [easyAccess]
}
```

All possible values for `configuration` are explained here:

### Vuex Easy Firestore integration for Google firebase

You can add compatibility for the amazing sister plugin: [Vuex Easy Firestore](https://github.com/mesqueeb/VuexEasyFirestore). To do so just pass a variable in the configuration object like so:

```js
const easyAccess = createEasyAccess({vuexEasyFirestore: true})
// and include as shown above
```

This will make sure that whenever you set a value in a module that's auto-synced to firestore through Vuex Easy Firestore, it will trigger the sync properly. Please see the [Vuex Easy Firestore documentation](https://github.com/mesqueeb/VuexEasyFirestore) for more information on how to set up auto-sync with firestore.

### get() set() function names

If for some reason you want to change the default function names for `store.get()` and `store.set()`, you can do so by passing an object to `createEasyAccess()` like so:

```js
const easyAccess = createEasyAccess({
  getter: 'getIt',
  setter: 'setIt'
})
// and include as shown above
```

Now you will only be able to use `store.getIt()` and `store.setIt()` instead.

## Feedback

Do you have questions, comments, suggestions or feedback? Or any feature that's missing that you'd love to have? Feel free to open an issue! ♥

Also check out the sister vuex-plugin for Firebase: [Vuex Easy Firestore](https://github.com/mesqueeb/VuexEasyFirestore)!

--

Happy Vuexing!<br>
-Luca Ban
