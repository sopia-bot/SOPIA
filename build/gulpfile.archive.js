const gulp = require('gulp');
const { npm } = require('./utils');

gulp.task('archive', function () {
  return npm('run', 'build', '--prefix', 'packages/archive');
});