const gulp = require('gulp');
const path = require('path');
const { npm } = require('./utils');
const Service = require('@vue/cli-service');
const logger = require('fancy-log');
const service = new Service(process.env.VUE_CLI_CONTEXT || path.join(process.cwd(), 'packages/view'));

const rawArgv = [];
const args = require('minimist')(rawArgv, {
  boolean: [
    // build
    'modern',
    'report',
    'report-json',
    'inline-vue',
    'watch',
    // serve
    'open',
    'copy',
    'https',
    // inspect
    'verbose'
  ]
});

gulp.task('view', function () {
  return service.run('build', args, rawArgv).catch(err => {
    logger(err);
    process.exit(1)
  });
});