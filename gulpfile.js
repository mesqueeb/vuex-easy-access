const gulp = require('gulp')
const eslint = require('gulp-eslint')
const uglify = require('gulp-uglify')
const pump = require('pump')
const rename = require('gulp-rename')
const babel = require('gulp-babel')

gulp.task('lint', function () {
  return gulp.src(['./src/**/*.js', './gulpfile.js'])
    .pipe(eslint({
      fix: true
    }))
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
    .on('error', console.error)
})

gulp.task('uglify', function () {
  return pump([
    gulp.src(['./src/**/*.js'])
      .pipe(babel({
        presets: ['es2015'],
        plugins: ['transform-object-rest-spread']
      }))
      .on('error', console.error),
    uglify(),
    rename({ suffix: '.min'}),
    gulp.dest('dist')])
})

gulp.task('babel', function () {
  return pump([
    gulp.src(['./src/**/*.js'])
      .pipe(babel({
        presets: ['es2015'],
        plugins: ['transform-object-rest-spread']
      }))
      .on('error', console.error),
    gulp.dest('dist')])
})

gulp.task('build', ['babel','uglify'], function () {})