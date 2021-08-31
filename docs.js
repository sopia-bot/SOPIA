const rimraf = require('rimraf');
const fs = require('fs');

if ( fs.existsSync('docs') ) {
	rimraf.sync('docs');
}

fs.cpSync('src', 'docs', { recursive: true });