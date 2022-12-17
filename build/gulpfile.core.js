const gulp = require('gulp');
const { createProject } = require('gulp-typescript');
const { npm } = require('./utils');
const project = createProject('packages/core/tsconfig.json');

gulp.task('core', function () {
  return project.src()
    .pipe(project())
    .pipe(gulp.dest('packages/core/dist'));
});