const gulp = require('gulp')
const nunjucks = require('gulp-nunjucks-render')

gulp.task('build', () =>
    gulp.src('src/*.html')
        .pipe(nunjucks({path: 'templates'}))
        .pipe(gulp.dest('dist'))
)

gulp.task('default', ['build'], ()=>{})