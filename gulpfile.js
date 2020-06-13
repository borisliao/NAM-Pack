const exec = require('child_process').exec
const gulp = require('gulp')
const babel = require('gulp-babel')
const css = require('gulp-clean-css')
const livereload = require('gulp-livereload')

// 1. Copy the index.html as is
gulp.task('html', () => {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('app/'))
    .pipe(livereload())
})
// 2. Compile CSS file and move them to the app folder
gulp.task('css', () => {
  return gulp.src('src/**/*.css')
    .pipe(css())
    .pipe(gulp.dest('app/'))
    .pipe(livereload())
})
// 3. Compile JS files and move them to the app folder
gulp.task('js', () => {
  return gulp.src(['main.js', 'src/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('app/'))
    .pipe(livereload())
})

gulp.task('watch', () => {
  livereload.listen()
  gulp.watch('src/**/*.html', gulp.series('html'))
  gulp.watch('src/**/*.css', gulp.series('css'))
  gulp.watch('src/**/*.js', gulp.series('js'))
})

// 4. Start the electron process.
gulp.task('start', gulp.series('html', 'css', 'js', () => { // 4.
  return exec(
    __dirname + '/node_modules/.bin/electron .'
  ).on('close', () => process.exit())
}))

gulp.task('build', gulp.series('html', 'css', 'js'))

gulp.task('default', gulp.parallel('start', 'watch'))

gulp.task('release', gulp.series('build', () => {
  return exec(
    __dirname + '/node_modules/.bin/electron-builder .'
  ).on('close', () => process.exit())
}))
