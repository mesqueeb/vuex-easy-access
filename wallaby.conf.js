module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.js',
    ],
    tests: [
      'test/*.js'
    ],
    testFramework: 'ava',
    env: {
			type: 'node',
			runner: 'node'
		},
    compilers: {
      '**/*.js': wallaby.compilers.babel({
        presets: ['@ava/babel-preset-env']
      }),
      '*.js': wallaby.compilers.babel({
        presets: ['@ava/babel-preset-env']
      }),
    },
    workers: {restart: true}
  }
}
