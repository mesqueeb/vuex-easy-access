# Hooks

## Warning

::: danger Please note that it is not recommended to use too much hooks in big applications.
<div style="margin-bottom: 1.5em"></div>
:::

If you want to add additional functionality to certain getters/setters **it is better to create a getters/mutation/action manually with a specific name.**

The reason is that setting up a hook into the regular `get()` or `set()` of Vuex Easy Access is done on the Vuex-module side, and thus **not clear from just looking at a Vue component**! So it's easy to forget and might put you in situations where you expected different behaviour.

Nevertheless, you can change the get/set behaviour as you please!

## Hook into get()

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

## Hook into set()

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

As you can see **you need to manually commit a mutation**. All these mutations are also already created by Vuex Easy Access for you. Please review the correct mutation syntax down below or check the [overview](reference.html).

### Syntax for overwriting setters

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

(Do not use conflicting choices in the plugin settings and the defaultMutations)

## Hook for Firestore sync

In cases you want to sync your Vuex store automatically with Firebase's Firestore see [Firestore integration (for Google Firebase)](advanced.html#firestore-integration-for-google-firebase).
