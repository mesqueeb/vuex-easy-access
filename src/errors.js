/* eslint-disable */
import defaultConfig from './defaultConfig'

function getErrors (conf, path, props) {
  const originInfo = (path || props) ? `problem with prop: \`${props}\` at path: \`${path}\`` : ''
  const tradPatt = (conf.pattern === 'traditional')
  const setter = conf.setter
  const deletor = conf.deletor
  const prop = 'items'
  const mutationNameSet = tradPatt ? 'SET_' + prop.toUpperCase() : prop
  const mutationNameDel = tradPatt ? 'DELETE_' + prop.toUpperCase() : prop

  const exampleSetters__Wildcard = `
    Correct usage examples:
    // From Vue-components:
    ${setter}('${prop}.*', {'123': {name: 'the best item'}})

    // From the Vuex store:
    dispatch('${setter}/${prop}.*', {'123': {name: 'the best item'}})
    // or
    commit('${mutationNameSet}.*', {'123': {name: 'the best item'}})`
  const exampleSetters__WildcardPath = ``
  const exampleSetters__DoubleWildcard = `
    Correct usage examples:
    // From Vue-components:
    ${setter}('${prop}.*.tags.*', ['123', {water: true}])

    // From the Vuex store:
    dispatch('${setter}/${prop}.*.tags.*', ['123', {water: true}])
    // or
    commit('${mutationNameSet}.*.tags.*', ['123', {water: true}])`
  const exampleDeletor = `
    Correct usage examples:
    // From Vue-components:
    ${deletor}('${prop}.*', '123')

    // From the Vuex store:
    dispatch('${deletor}/${prop}.*', '123')
    // or
    commit('${mutationNameDel}.*', '123')`

  return {
    mutationSetterNoId: `${originInfo}
      The payload needs to be an object with an \`id\` field.
      ${exampleSetters__Wildcard}`,
    mutationSetterPropPathWildcardMissingItemDoesntExist: `${originInfo}
      The item does not exist! Make sure you first set the item.
      ${exampleSetters__Wildcard}`,
    mutationSetterPropPathWildcardIdCount: `${originInfo}
      The amount of ids and wildcards \`'*'\` are not equal.
      If you have multiple wildcards you need to pass an array, where each item is an ID and the last is the property you want to set.
      ${exampleSetters__DoubleWildcard}
      `,
    mutationDeleteNoId: `${originInfo}
      The payload needs to be an object with an \`id\` field.
      ${exampleDeletor}
      `,
    wildcardFormatWrong: `${originInfo}
      There was something wrong with the payload passed when using a path with wildcards.

      A) Path with wildcard:
      ${exampleSetters__Wildcard}

      B) Path with multiple wildcards:
      ${exampleSetters__DoubleWildcard}
    `,
    missingDeleteMutation: `
      There is no mutation set for '${path}'.
      Something went wrong with your vuex-easy-access setup.
      Did you manually add \`...defaultMutations(state)\` to your modules?
      See the documentation here:
        https://github.com/mesqueeb/VuexEasyAccess#setup


      // You can also manually add a mutation like so in the correct module (not recommended!!):
      mutations: {
        '${tradPatt ? 'DELETE_' + props.toUpperCase() : '-' + props}': (state, payload) => {
          this._vm.$delete(state.${props})
        }
      }
    `,
    missingSetterMutation: `
      There is no mutation set for '${path}'.
      Something went wrong with your vuex-easy-access setup.
      Did you manually add \`...defaultMutations(state)\` to your modules?
      See the documentation here:
        https://github.com/mesqueeb/VuexEasyAccess#setup


      // You can also manually add a mutation like so in the correct module (not recommended!!):
      mutations: {
        '${tradPatt ? 'SET_' + props.toUpperCase() : props}': (state, payload) => {
          state.${props} = payload
        }
      }
    `,
  }
}
/**
 * Error logging
 *
 * @export
 * @param {string} error the error code
 * @param {object} conf the user config
 * @param {string} path (optional) the path the error occured in
 * @param {string} props (optional) the props the error occured with
 * @returns {string} the error code
 */
export default function (error, conf = {}, path, props) {
  conf = Object.assign({}, defaultConfig, conf)
  const errorMessages = getErrors(conf, path, props)
  console.error('[vuex-easy-access] Error!', errorMessages[error])
  return error
}
