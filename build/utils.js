const { spawn } = require('child_process');

exports.npm = (...args) =>
  spawn(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args,
    { stdio: 'inherit', stdout: 'inherit', stderr: 'inherit' },
  );