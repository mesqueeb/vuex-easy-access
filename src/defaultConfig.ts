
export interface IDefaultConfig {
  setter?: string
  getter?: string
  deletor?: string
  vuexEasyFirestore?: boolean
  ignorePrivateProps?: boolean
  ignoreProps?: string[]
  pattern?: string
}

export default {
  setter: 'set',
  getter: 'get',
  deletor: 'delete',
  vuexEasyFirestore: false,
  ignorePrivateProps: true,
  ignoreProps: [],
  pattern: 'simple'
}
