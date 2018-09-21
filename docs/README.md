# What is Vuex Easy Access?

1. Zero boilerplate Vuex → auto generated actions & mutations!
2. Unified syntax for accessing your store through simple `set()` and `get()`

## Motivation

[Vuex](https://vuex.vuejs.org/) is great for state management in a VueJS app, however **it requires a lot of boilerplating** setting up your store and all actions and mutations.

#### The Vuex philosophy

The philosophy of Vuex is to do everything through mutations that will record a history of the changes you make to the store. This makes it possible to easily track changes when things go wrong as your app grows.

#### The Vuex Easy Access philosophy
Instead of having to write all actions and mutations for each change you make to the store, wouldn't it be great if an action and mutation is generated for you from the start? That's exactly what Vuex Easy Access does!

> Vuex Easy Access automatically generates actions and mutations for each state property!

JavaScript | Vuex Easy Access
-- | --
In vanilla JavaScript you can simply do:<br>`object.prop.nestedProp = newVal`<br>why shouldn't you be able to do this with Vuex? | With Vuex Easy Access you can!<br>`set('object.prop.nestedProp', newVal)`

And the best part is, all state changes go through a mutation under the hood!

## Features

- Automatically generated actions & mutations to:
  - Set state values
  - Set nested state values
  - Delete values
  - **Arrays:** Push/shift/pop/splice values
  - **Objects:** use ID wildcards
- Shorthand `store.set()` for all the above
- Streamlined `store.get()` to get state valuess

## Short overview

### 1. auto-generated Vuex actions

_ | actions generated from state
--|--
**State props** | eg. ```state: {someProp: {nestedProp: ''}}```
Set values<br>Set nested values<br><br>Delete values | `dispatch('module/set/someProp', newVal)`<br>`dispatch('module/set/someProp.nestedProp', newVal)`<br>`dispatch('module/delete/someProp')`<br>`dispatch('module/delete/someProp.nestedProp')`
**Array props** | eg. ```state: {someArray: []}```
Push/shift/pop/splice values | `dispatch('module/set/someArray.push', newVal)`<br>`dispatch('module/set/someArray.shift', newVal)`<br>`dispatch('module/set/someArray.pop', newVal)`<br>`dispatch('module/set/someArray.splice', newVal)`
**Objects with id wildcard** | eg. ```state: {someObject: {'*': ''}}```
Set and delete | `dispatch('module/set/someObject.*', {[id]: newVal})`<br>`dispatch('module/delete/someObject.*', id)`

### 2. Easy Access shorthand

_ | available setters
--|--
**State props** | eg. ```state: {someProp: {nestedProp: ''}}```
Set values<br>Set nested values<br><br>Delete values | `set('module/someProp', newVal)`*<br>`set('module/someProp.nestedProp', newVal)`<br>`delete('module/someProp')`<br>`delete('module/someProp.nestedProp')`
**Array props** | eg. ```state: {someArray: []}```
Push/shift/pop/splice values | `set('module/someArray.push', newVal)`<br>`set('module/someArray.shift', newVal)`<br>`set('module/someArray.pop', newVal)`<br>`set('module/someArray.splice', newVal)`
**Objects with id wildcard** | eg. ```state: {someObject: {'*': ''}}```
Set and delete | `set('module/someObject.*', {[id]: newVal})`<br>`delete('module/someObject.*', id)`

\* `set()` and `delete()` are attached to the Vuex `store` object: `store.set()`
