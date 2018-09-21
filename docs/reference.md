# Reference

## All auto-generated setters / actions / mutations

Vuex Easy Access creates one setter / action / mutation for every single property in your store! All AUTOMATICALLY!

Here is the overview of an example store and everything that will be auto generated:

### Regular state props

```js
// Only required setup
state: {
  someProp: {nestedProp: ''}
}
// Gives you access to:

// Easy Access shorthand
set('module/someProp', newVal)
set('module/someProp.nestedProp', newVal)
delete('module/someProp')
delete('module/someProp.nestedProp')

// auto-generated Vuex actions
dispatch('module/set/someProp', newVal)
dispatch('module/set/someProp.nestedProp', newVal)
dispatch('module/delete/someProp')
dispatch('module/delete/someProp.nestedProp')

// auto-generated Vuex mutations
commit('module/someProp', newVal)
commit('module/someProp.nestedProp', newVal)
commit('module/-someProp')
commit('module/-someProp.nestedProp')`
```

### Array state props

```js
// Only required setup
state: {
  someArray: []
}
// Gives you access to:

// Easy Access shorthand
set('module/someArray.push', newVal)
set('module/someArray.shift', newVal)
set('module/someArray.pop', newVal)
set('module/someArray.splice', newVal)

// auto-generated Vuex actions
dispatch('module/set/someArray.push', newVal)
dispatch('module/set/someArray.shift', newVal)
dispatch('module/set/someArray.pop', newVal)
dispatch('module/set/someArray.splice', newVal)

// auto-generated Vuex mutations
commit('module/someArray.push', newVal)
commit('module/someArray.shift', newVal)
commit('module/someArray.pop', newVal)
commit('module/someArray.splice', newVal)
```

### Wildcard state props

```js
// Only required setup
state: {
  someObject: {'*': ''}
}
// Gives you access to:

// Easy Access shorthand
set('module/someObject.*', {[id]: newVal})
delete('module/someObject.*', id)

// auto-generated Vuex actions
dispatch('module/set/someObject.*', {[id]: newVal})
dispatch('module/delete/someObject.*', id)

// auto-generated Vuex mutations
commit('module/someObject.*', {[id]: newVal})
commit('module/-someObject.*', id)
```

### Getters

```js
// Getters you can use
$store.get('any/path/as.seen.above')
```

And Vuex Easy Access does all this for you... All you have to do is write your state! That's it!<br>Say goodbye to boilerplating. Don't let it be a roadblock in order to do best practices!
