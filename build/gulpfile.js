const gulp = require('gulp');

require('./gulpfile.app');
require('./gulpfile.core');
require('./gulpfile.view');

gulp.task('default', gulp.parallel(['core', 'app', 'view']));