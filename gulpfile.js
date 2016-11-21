var gulp = require('gulp');

// compile all libraries (js + css) into their respective dist folders.
gulp.task('compileLibs', function() {
  gulp.src([
    'node_modules/vue/dist/vue.min.js',
    'bower_components/pen/src/pen.js',
    'bower_components/pen/src/markdown.js'
  ]).pipe(gulp.dest('dist/js/'))

  gulp.src('bower_components/pen/src/pen.css').pipe(gulp.dest('dist/css/'))
  gulp.src('manifest.json').pipe(gulp.dest('dist/'))
})

// move the working directory, app, into the final dist.
gulp.task('compileApp', function() {
  gulp.src(['app/**/*']).pipe(gulp.dest('dist/'))
})

// default tasks to run on `gulp` + watch for changes in `/app`
gulp.task('default', ['compileApp', 'compileLibs'], function() {
  gulp.watch(['app/**/*'], ['compileApp'])
})
