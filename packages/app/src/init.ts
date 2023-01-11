import path from 'node:path';
import fs from 'node:fs';
import { app, protocol } from 'electron';
import { setBundleDir } from './utils/common';

setBundleDir();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

console.log('Development:', process.env.NODE_ENV);

/* INIT DIR */
const bundleDir = path.join(app.getPath('userData'), 'bundles');
if ( !fs.existsSync(bundleDir) ) {
	fs.mkdirSync(bundleDir);
}

const sopiaDir = path.join(app.getPath('userData'), 'sopia');
if ( !fs.existsSync(sopiaDir) ) {
	fs.mkdirSync(sopiaDir);
}

console.log('bundle dir', bundleDir);

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');