const package = require('./package.json');
const fs = require('fs');
const path = require('path');

if ( !fs.existsSync('./release-builds/SOPIA-win32-ia32') ) {
	throw Error('Can not find release folder');
}

const target = `SOPIA-${package.version}`;

fs.renameSync('./release-builds/SOPIA-win32-ia32', path.join('./release-builds', target));

for ( const item of fs.readdirSync('./static-dir') ) {
	const src = path.join('./static-dir', item);
	fs.cpSync(src, path.join('./release-builds', target, item), { recursive: true, force: true });
}

const config = require(`./release-builds/${target}/config.json`);
config.version = package.version;
fs.writeFileSync(`./release-builds/${target}/config.json`, JSON.stringify(config, null, '\t'), { encoding: 'utf8' });