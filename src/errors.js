
export default function (error) {
  if (error === 'mutationSetterWildcard') {
    console.error(`[vuex-easy-access] The payload needs to be an object with an ID field.
      Correct usage example:
        commit('items/*', {id: '123', name: 'the best item'})
    `)
  }
  if (error === 'mutationDeleteWildcard') {
    return console.error(`[vuex-easy-access] The payload needs to be an object with an ID field.
      Correct usage example:
        commit('-items/*', {id: '123'})
        // or
        commit('-items', '123')
    `)
  }
}
