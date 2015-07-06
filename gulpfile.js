/*global require*/

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    htmlreplace = require('gulp-html-replace'),
    uglify = require('gulp-uglify'),
    del = require('del');

gulp.task('clean', function (cb) {
    'use strict';
    del(['dist/*'], cb);
});

gulp.task('scripts', ['clean'], function () {
    'use strict';
    return gulp.src(['js/klad.js', 'js/img.js', 'js/keys.js', "js/maze.js",
        "js/levels.js", "js/bullet.js", "js/human.js", "js/main.js"])
        .pipe(concat('klad.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['scripts'], function () {
    'use strict';
    return gulp.src('index.html')
        .pipe(htmlreplace({
            'js': 'klad.js'
        }))
        .pipe(gulp.dest('dist'));
});