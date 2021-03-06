# Installation & setup

## Installation

```bash
npm i --save vuex-easy-access vue
# or
yarn add vuex-easy-access vue
```

Vue is a peer dependency; It will use your existing version.

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
