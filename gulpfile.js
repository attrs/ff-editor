'use strict';

const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify');
const rimraf = require('gulp-rimraf');
const header = require('gulp-header');
const webpack = require('webpack-stream');

const pkg = require('./package.json');
const dist = path.join(__dirname, 'dist');

gulp.task('build.js.clean', () => {
  return gulp.src('dist', { read: false })
    .pipe(rimraf());
});

gulp.task('build.webpack', ['build.js.clean'], () => {
  var conf = require('./webpack.config.js');
  delete conf.output.path;
  
  return gulp.src('lib/index.js')
    .pipe(webpack(conf))
    .pipe(gulp.dest(dist));
});

gulp.task('build', ['build.webpack'], () => {
  return gulp.src(path.join(dist, 'firefront.js'))
    .pipe(header([
      '/*!',
      '* <%= pkg.name %>',
      '* <%= pkg.homepage %>',
      '*',
      '* Copyright attrs and others',
      '* Released under the MIT license',
      '* https://github.com/<%=pkg.repository%>/blob/master/LICENSE',
      '*/',
      ''
    ].join('\n'), { pkg: pkg }))
    .pipe(gulp.dest(dist))
    .pipe(uglify())
    .pipe(header('/*! <%= pkg.name %> - attrs */', { pkg: pkg }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(dist));
});

// conclusion
gulp.task('watch', ['build.watch']);
gulp.task('default', ['build']);
