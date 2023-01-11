const { spawn } = require('child_process');
const gulp = require('gulp');
const { createProject } = require('gulp-typescript');
const { npm } = require('./utils');
const project = createProject('packages/app/tsconfig.json');
const builder = require('electron-builder');

require('./gulpfile.archive');
require('./gulpfile.bridge');

gulp.task('app:typescript', function() {
  return project.src()
    .pipe(project())
    .js
    .pipe(gulp.dest('packages/app/.build'));
});

gulp.task('app:icon-build', () => npm('run', 'icon-build', '--prefix', 'packages/app'));
gulp.task('app:copy', () => gulp.src([
  'packages/app/package.json',
  'packages/app/electron.build.json',
]).pipe(gulp.dest('packages/app/.build')));
gulp.task('app:electron', function (done) {
  builder.build({
    projectDir: 'packages/app',
    config: 'electron.build.json',
  }).then(() => done());
});

gulp.task('app', gulp.series([
  'archive',
  'bridge',
  'app:typescript',
  'app:icon-build',
  'app:copy',
  'app:electron',
]));