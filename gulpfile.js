'use strict';

const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const rimraf = require('gulp-rimraf');
const header = require('gulp-header');
const less = require('gulp-less');
const csso = require('gulp-csso');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const webpack = require('webpack');
const pkg = require('./package.json');

gulp.task('build.js.clean', () => {
  return gulp.src(['dist', 'docs/js', 'docs/css'], { read: false })
    .pipe(rimraf());
});

gulp.task('build.webpack', ['build.js.clean'], (done) => {
  webpack(require('./webpack.config.js'), function(err, stats) {
    if( err ) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({
      colors: true,
      children: true,
      chunks: true,
      modules: true
    }));
    done();
  });
});

gulp.task('build.docs', ['build.webpack'], () => {
  return gulp.src(path.join('docs/less/index.less'))
    .pipe(less({
      paths: ['docs']
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest('docs/css'))
    .pipe(csso())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('docs/css'));
});

gulp.task('build', ['build.docs'], () => {
  return gulp.src(path.join('dist/ff.js'))
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
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(header('/*! <%= pkg.name %> - attrs */', { pkg: pkg }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dist'));
});

// conclusion
gulp.task('watch', ['build.watch']);
gulp.task('default', ['build']);
