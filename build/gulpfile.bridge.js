const gulp = require('gulp');
const { createProject } = require('gulp-typescript');
const project = createProject('packages/context-bridge/tsconfig.json');
const { npm } = require('./utils');

gulp.task('bridge', function () {
  return npm('run', 'build', '--prefix', 'packages/context-bridge')
  return project.src()
    .pipe(project())
    .pipe(gulp.dest('packages/context-bridge/dist'));
});