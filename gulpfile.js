const gulp = require('gulp'),
      bower = require('gulp-bower'),
      nunjucks = require('gulp-nunjucks-render'),
      rollup = require('rollup-stream'),
      rollup_babel = require('rollup-plugin-babel'),
      rollup_builtins = require('rollup-plugin-node-builtins'),
      rollup_commonjs = require('rollup-plugin-commonjs'),
      rollup_resolve = require('rollup-plugin-node-resolve'),
      source = require('vinyl-source-stream')


gulp.task('bower', function() {
  return bower()
})


gulp.task('rollup', () => {
    return rollup({
            entry: 'src/support.js',
            format: 'iife',
            moduleName: 'support',
            plugins: [
                rollup_resolve({preferBuiltins: false}),
                rollup_commonjs({
                    namedExports: {
                        'node_modules/events/events.js' : ['EventEmitter']
                    }
                })
            ]
        })
        .pipe(source('support.js'))
        .pipe(gulp.dest('./dist'))
})

gulp.task('templating', () =>
    gulp.src('src/*.html')
        .pipe(nunjucks({path: 'templates'}))
        .pipe(gulp.dest('dist'))
)


gulp.task('build', ['bower', 'templating', 'rollup'], () => {})

gulp.task('default', ['build'], ()=>{})
