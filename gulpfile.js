/*global require*/

var gulp = require('gulp'),
    htmlreplace = require('gulp-html-replace'),
    uglify = require('gulp-uglify'),
    del = require('del'),
    sourcemaps = require('gulp-sourcemaps'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    babelify= require('babelify');

gulp.task('clean', function (cb) {
    'use strict';
    del(['dist/*'], cb);
});

gulp.task('scripts', ['clean'], function () {
    'use strict';

    return browserify('./js/app.js', {debug: true})
        .add(require.resolve('babel/polyfill'))
        .transform(babelify)
        .bundle()
        .pipe(source('./js/app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['scripts'], function () {
    'use strict';
    return gulp.src('index.html')
        .pipe(htmlreplace({
            'js': 'js/app.js'
        }))
        .pipe(gulp.dest('dist'));
});
