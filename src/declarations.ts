
export { IDefaultConfig } from './defaultConfig'

export type AnyObject = {[key: string]: any}

export interface IInitialisedStore {
  state: AnyObject
  getters: AnyObject
  dispatch: (path: string, payload: any) => any
  commit: (path: string, payload: any) => any | void
  _actions: AnyObject
  _mutations: AnyObject
  _modulesNamespaceMap: AnyObject
  registerModule: (name: string | string[], module: any) => any
}
