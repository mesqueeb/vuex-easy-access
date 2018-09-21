
module.exports = {
  title: 'Vuex Easy Access',
  description: 'Unified syntax for accessing your Vuex store through simple set() and get() functions + auto generate mutations.',
  base: '/vuex-easy-access/',
  ga: 'UA-92965499-4',
  themeConfig: {
    displayAllHeaders: true,
    sidebar: [
      ['/', 'What is Vuex Easy Access?'],
      '/setup',
      '/guide',
      '/advanced',
      '/hooks',
      '/reference',
      '/feedback',
    ],
    nav: [
      { text: 'Changelog', link: 'https://github.com/mesqueeb/vuex-easy-access/releases' },
    ],
    repo: 'mesqueeb/vuex-easy-access',
    repoLabel: 'Github',
    docsDir: 'docs',
    docsBranch: 'dev',
    editLinks: true,
  }
}
