import path from 'path';
import fs from 'fs';
import { app } from 'electron';


/* INIT DIR */
const bundleDir = path.join(app.getPath('userData'), 'bundles');
if ( !fs.existsSync(bundleDir) ) {
	fs.mkdirSync(bundleDir);
}

const sopiaDir = path.join(app.getPath('userData'), 'sopia');
if ( !fs.existsSync(sopiaDir) ) {
	fs.mkdirSync(sopiaDir);
}

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
