/*global require:false*/
/*global require*/

var gulp = require('gulp');
var concat = require('gulp-concat');
var htmlreplace = require('gulp-html-replace');
var uglify = require('gulp-uglify');
var smoosher = require('gulp-smoosher');
var htmlmin = require('gulp-minify-html');
var clean = require('gulp-clean');

gulp.task('clean', function () {
    'use strict';
    return gulp.src('build/*.*', {read: false})
        .pipe(clean());
});

gulp.task('scripts', ['clean'], function () {
    'use strict';
    return gulp.src(['js/klad.js', 'js/img.js', 'js/keys.js', "js/maze.js",
        "js/levels.js", "js/bullet.js", "js/human.js", "js/main.js"])
        .pipe(concat('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});

gulp.task('default', ['scripts'], function () {
    'use strict';
    return gulp.src('index.html')
        .pipe(htmlreplace({
            'js': 'build/all.min.js'
        }))
        .pipe(smoosher())
        .pipe(htmlmin())
        .pipe(gulp.dest('build'));
});
