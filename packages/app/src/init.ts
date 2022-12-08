import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { setBundleDir } from './utils';

setBundleDir();

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
