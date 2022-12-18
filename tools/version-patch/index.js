const axios = require('axios');
const { writeFileSync } = require('fs');
const path = require('path');


function versionPatch(path, version) {
  const pkg = require(path);
  pkg.version = version;
  writeFileSync(path, JSON.stringify(pkg, null, '  '));
}

(async () => {
  const { data:release } = await axios.get('https://api.github.com/repos/sopia-bot/SOPIA/releases/latest');

  const version = release.tag_name;

  versionPatch(path.join(__dirname, '../../package.json'), version);
  versionPatch(path.join(__dirname, '../../packages/app/package.json'), version);
})();