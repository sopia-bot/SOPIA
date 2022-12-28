const gulp = require('gulp');
const { createProject } = require('gulp-typescript');
const project = createProject('packages/context-bridge/tsconfig.json');

gulp.task('bridge', function () {
  return project.src()
    .pipe(project())
    .pipe(gulp.dest('packages/context-bridge/dist'));
});