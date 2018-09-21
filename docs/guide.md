# Guide

To keep everything fun we're gonna explain things with the example of a Pokémon app. 🐞

## get() set() example

First have our "player" with one primary Pokémon:

- module: `player/`
- state: `{party: {primary: 'bulbasaur'}}`

Now we need a page with an option to swap the primary Pokémon:

```html
<template>
  Primary Pokémon: {{ $store.get('player/party.primary') }}
  <button @click="$store.set('player/party.primary', 'squirtle')">Swap for Squirtle!</button>
</template>
```

Nothing required inside your Vue component methods! Very clean! 🏄🏼‍

## Regular state props

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

// Actions you can use (from `set/` sub-module)
dispatch('player/set/party', newParty)
dispatch('player/set/party.primary', newPokemon)
```

## Array state props []

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

## Wildcard state props 🃏

Just add `'*'` as prop in your state and you will have super powers 💪🏻!

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

```js
// Getters you can use
$store.get('any/path/as.seen.above')
```

## set() in the Vuex store

Besides `set()` on the store object, there is also a special setter created for each prop as an action you can dispatch!

Your module `player/` will automatically receive a sub-module called `player/set/`! In this sub-module the actions are created to set each of the props of `player/`.

This makes it possible for you to do:

```js
// in the `player/` module
actions: {
  randomizePrimaryPokemon ({dispatch}) {
    dispatch('set/party.primary', random())
  }
}
```

The sub-module `set/` with the action `primary` are automatically created and commit to your store!
