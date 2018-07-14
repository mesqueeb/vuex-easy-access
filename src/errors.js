
function getErrors (conf, mutationPath, mutationName, props) {
  const setter = conf.setter
  const deletor = conf.deletor
  const prop = (conf.pattern === 'traditional') ? 'ITEMS' : 'items'
  const deleteSign = (conf.pattern === 'traditional') ? 'DELETE_' : '-'
  return {
    mutationSetterNoId: `The payload needs to be an object with an ID field.
      Correct usage examples:
      ${setter}('${prop}.*', {id: '123', name: 'the best item'})
      // or
      dispatch('${setter}/${prop}.*', {id: '123', name: 'the best item'})
      // or
      commit('${prop}.*', {id: '123', name: 'the best item'})
    `,
    mutationDeleteNoId: `The payload needs to be an object with an ID field.
      Correct usage examples:
      ${deletor}('${prop}/*', {id: '123'})
      // or
      ${deletor}('${prop}', '123')
      // or
      dispatch('${deletor}/${prop}/*', {id: '123'})
      // or
      dispatch('${deletor}/${prop}', '123')
      // or
      commit('${deleteSign}${prop}/*', {id: '123'})
      // or
      commit('${deleteSign}${prop}', '123')
    `,
    missingDeleteMutation: `There is no mutation set for '${mutationPath}'.
      Please enable auto-mutations with vuex-easy-access.
      See the documentation here (very easy):
        https://github.com/mesqueeb/VuexEasyAccess#2-automatically-generate-mutations-for-each-state-property

      // OR manually add a mutation like so in the correct module (not recommended):
      mutations: {
        '${mutationName}': (state, payload) => {
          this._vm.$delete(state.${props})
        }
      }
    `,
    missingSetterMutation: `There is no mutation set for '${mutationPath}'.
      Please enable auto-mutations with vuex-easy-access.
      See the documentation here (very easy):
        https://github.com/mesqueeb/VuexEasyAccess#2-automatically-generate-mutations-for-each-state-property

      // OR manually add a mutation like so in the correct module (not recommended):
      mutations: {
        '${mutationName}': (state, payload) => {
          state.${props} = payload
        }
      }
    `,
  }
}

export default function (error, conf, mutationPath, mutationName, props) {
  const errorMessages = getErrors(conf, mutationPath, mutationName, props)
  console.error('[vuex-easy-access] Error!')
  console.error(errorMessages[error])
  return error
}
