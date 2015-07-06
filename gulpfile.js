/*global require*/

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    htmlreplace = require('gulp-html-replace'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean');

gulp.task('clean', function () {
    'use strict';
    return gulp.src('dist/*.*', {read: false})
        .pipe(clean());
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
