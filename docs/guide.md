# Guide

To keep everything fun we're gonna explain things with the example of a Pokémon app. 🐞

## get() set() example

Vuex Easy Access adds a `get()` and `set()` function on the store object, as can be seen in the following example:

- module: `player/`
- state: `{party: {primary: 'bulbasaur'}}`

We have a `player/` module with one `primary` Pokémon. Let's create a Vue component with an option to swap the primary Pokémon:

```html
<template>
  Primary Pokémon: {{ $store.get('player/party.primary') }}
  <button @click="$store.set('player/party.primary', 'squirtle')">Swap for Squirtle!</button>
</template>
```

Nothing required inside your Vue component methods! Very clean! 🏄🏼‍

With Vuex Easy Access you **only need to set your state** and you can use these handy setters automatically!

## set as Vuex action

Besides `set()` on the store object, you also get Vuex actions! Any module will automatically receive a sub-module called `/set/`! In this sub-module the actions are created to set each of the state props.

So in our example we would receive the following a sub module:

```js
state: {party: {primary: 'bulbasaur'}},
actions: {
  'party': () => {} // set the prop `party`
  'party.primary': () => {} // set `primary` inside `party`
}
```

This makes it possible for you to do things like:

```js
actions: {
  randomizePrimaryPokemon ({dispatch}) {
    dispatch('set/party.primary', random())
  }
}
```

Below we see how you can set up the state and what kind of powers that will give you in each case. The actions you'll receive will differ slightly based on the kind of state props you have.

## Regular state props

Every single state prop (and nested ones) will receive a **getter, setter and deletor** (is that a word? :).

```js
// module: `player/`
state: {
  party: {
    primary: ''
  },
}

// Setters you can use from Vue components
$store.set('player/party', newParty) // modules end in `/`
$store.set('player/party.primary', newPokemon) // separate sub-props with `.`
$store.delete('player/party.primary') // completely deletes props

// Actions you can use (from `set/` sub-module)
dispatch('player/set/party', newParty)
dispatch('player/set/party.primary', newPokemon)
dispatch('player/delete/party.primary') // completely deletes props
```

Delete uses `Vue.delete` under the hood, so reactivity works as expected. However: be careful of the `delete` action, because **it will completely delete the property**. In most cases it's better to just `set('player/party.primary', null)`.

## Array props []

If a state prop is an empty array `[]` you will have super powers 💪🏻! Push, pop, shift, splice just like regular JavaScript!

```js
// module: `player/`
state: {
  pokeBox: [],
}

// Setters you can use from Vue components
$store.set('player/pokeBox.push', newPokemon)
$store.set('player/pokeBox.pop')
$store.set('player/pokeBox.shift')
$store.set('player/pokeBox.splice', [0, 1, newPokemon]) // second argument is an array

// Actions you can use (from `set/` sub-module)
dispatch('player/set/pokeBox.push', newPokemon)
dispatch('player/set/pokeBox.pop')
dispatch('player/set/pokeBox.shift')
dispatch('player/set/pokeBox.splice', [0, 1, newPokemon])
```

## ID wildcard props 🃏

Just add `'*'` as prop in your state and you will have super powers 💪🏻! Perfect for working with IDs! This uses `Vue.set` under the hood, so reactivity works as expected.

```js
// module: `player/`
state: {
  pokeDex: {
    '*': {
      name: '',
      seen: false,
      types: {'*': false}
    }
  },
}

// Setters you can use from Vue components
$store.set('player/pokeDex.*', {'001': {name: 'Bulbasaur'}}) // or
$store.set('player/pokeDex.*', {id: '001', name: 'Bulbasaur'})
// You can use pass `{[id]: item}` or `{id, item}` as the payload
$store.delete('player/pokeDex.*', id)

// Actions you can use (from `set/` sub-module)
dispatch('player/set/pokeDex.*', newPokemon) // info on payload above
dispatch('player/delete/pokeDex.*', id) // from `delete/` sub-module
```

## Wildcard default values

As per the example above, values to be expected for each Pokémon are `name`, `seen` and `types`. When you define your state like so, **all expected values will automatically be added** to any new Pokémon you insert!

```js
$store.set('player/pokeDex.*', {'001': {name: 'Bulbasaur'}})
// results in the state:
pokeDex: {
  '001': {
    name: 'Bulbasaur',
    seen: false, // automatically added
    types: {} // automatically added
  }
}
```

## Multiple wildcards

You can work with multiple wildcards! Let's edit the sub props of our Bulbasaur.

```js
const id = '001'

// Use an array to pass each id/value for * in the path
$store.set('player/pokeDex.*.seen', [id, true])
// the * in the path receives the id passed first
// `seen` prop receives `true` passed second

// Use {[id]: value} for passing a value to a second wildcard
$store.set('player/pokeDex.*.types.*', [id, {'grass': true}])
// `grass` in `types` will be set to true (any other types set stay as is!)

// results in the state:
pokeDex: {
  '001': {
    name: 'Bulbasaur',
    seen: true, // set through `*.seen`
    types: {grass: true} // set through `*.types.*`
  }
}

// All this is also possible from actions of course:
dispatch('player/set/pokeDex.*.seen', [id, true])
dispatch('player/set/pokeDex.*.types.*', [id, {'grass': true}])
```

## Getters

Remember, paths for setters and getters use `/` for modules and `.` for sub props.

```js
// Getters you can use
$store.get('any/path/as.seen.above')
```

I hope you understood the basics! If there are any unclear parts please open an [issue](https://github.com/mesqueeb/vuex-easy-access/issues) and let me know! I'll try to improve the docs as much as possible.
