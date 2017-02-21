const gulp = require('gulp')
const nunjucks = require('gulp-nunjucks-render'),
      rollup_babel = require('rollup-plugin-babel'),
      rollup_resolve = require('rollup-plugin-node-resolve'),
      rollup_builtins = require('rollup-plugin-node-builtins'),
      source = require('vinyl-source-stream'),
      rollup = require('rollup-stream')


gulp.task('rollup', () => {
    return rollup({
            entry: 'src/support.js',
            format: 'iife',
            moduleName: 'metis',
            plugins: [
                //rollup_multi(),
                rollup_babel({
                    //presets: [ "es2015-rollup" ],
                }),
                rollup_resolve({module: true, main: true}),
                rollup_builtins()
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


gulp.task('build', ['templating', 'rollup'], () => {})

gulp.task('default', ['build'], ()=>{})
