/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

"use strict";

var plumber = require("gulp-plumber");
var through = require("through2");
var chalk   = require("chalk");
var newer   = require("gulp-newer");
var babel   = require("gulp-babel");
var watch   = require("gulp-watch");
var gutil   = require("gulp-util");
var gulp    = require("gulp");
var path    = require("path");
var fs      = require("fs");

var babelRc = JSON.parse(fs.readFileSync(path.join(__dirname, ".babelrc"), "utf8"));

function build(lib, opts) {
  return gulp.src("src/**/*.js")
    .pipe(plumber({
      errorHandler: function (err) {
        gutil.log(err.stack);
      }
    }))
    .pipe(through.obj(function (file, enc, callback) {
      file._path = file.path;
      file.path = file.path.replace("src", lib);
      callback(null, file);
    }))
    .pipe(newer("lib"))
    .pipe(through.obj(function (file, enc, callback) {
      gutil.log("Compiling", "'" + chalk.cyan(file._path) + "' to '" + chalk.cyan(file.path) + "'...");
      callback(null, file);
    }))
    .pipe(babel(opts))
    .pipe(gulp.dest("lib"));
}

gulp.task("default", ["build"]);

gulp.task("build", ["build-modern", "build-legacy"]);

gulp.task("build-modern", function () {
  return build("lib", babelRc.env.node5);
});

gulp.task("build-legacy", function () {
  return build("lib-legacy", babelRc.env["pre-node5"]);
});

gulp.task("watch", ["build"], function () {
  watch("src/**/*.js", function () {
    gulp.start("build");
  });
});
