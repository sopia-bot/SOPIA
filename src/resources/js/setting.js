window.settingLoaded = false;
window.settingChanged = false;

const vfMsg = '<code>[[ver]]</code> 버전을 유지하는 것으로 설정하셨습니다. 수동업데이트를 진행하지 않는한 업데이트가 되지 않습니다.';
const ltMsg = '항상 최신 버전을 유지하는 것으로 설정하셨습니다. 새로운 버전이 나오면 자동업데이트됩니다.';

const versionApply = async () => {
    let msg = '';
    if ( sopia.config.reqVer && sopia.config.reqVer != sopia.config.version ) {
        if ( sopia.config['version-fix'] ) {
            msg = vfMsg.replace(/\[\[ver\]\]/g, sopia.config.reqVer);
        } else {
            msg = ltMsg;
        }
        
        const res = await sopiaConfirm(msg);
        if ( res ) {
            AllSettingSave(sopia.config, () => {
                app.relaunch();
                app.exit();
            }, true);
        }
    }
    UIkit.modal('#version-modal').hide();
    window.settingChanged = false;
}

const versionCancel = () => {
    if ( window.settingChanged ) {
        const config = JSON.parse(fs.readFileSync(getPath('./config.json', true), 'utf8'));
        const fixed = config['version-fix'];
        delete sopia.config.reqVer;
        sopia.config['version-fix'] = fixed;
    }
    window.settingChanged = false;
}

const SETTINGLoading = async () => {

    if ( settingLoaded ) {
        return true;
    }
    settingLoaded = true;

    const vlist = document.querySelector('#version-list');

    let notes = await axios.get('https://sopia-bot.firebaseio.com/notes.json');
    notes = notes.data;
    let { data } = await axios.get('https://sopia-bot.firebaseio.com/app/update.json');
    let versions = [];

    versions = Object.keys(data).reverse().filter(ver => !!ver.match(/\d+-\d+-\d+/)).sort((ver1, ver2) => {
		const v1 = parseVersion(ver1.replace(/\-/g, '.'));
		const v2 = parseVersion(ver2.replace(/\-/g, '.'));

		if ( v1.app === v2.app ) {
			if ( v1.major === v2.major ) {
				if ( v1.minor === v2.minor ) {
					return 0;
				} else {
					return v2.minor - v1.minor;
				}
			} else {
				return v2.major - v1.major;
			}
		} else {
			return v1.app - v2.app;
		}
	});

    let li = document.createElement('li');
    if ( !sopia.config['version-fix'] ) {
        li.className = 'uk-open';
    }
    li.addEventListener('click', (evt) => {
        sopia.config['version-fix'] = false;
        if ( sopia.config.version != versions[0] ) {
            sopia.config.reqVer = versions[0].replace(/-/g, '.');
            window.settingChanged = true;
        }
    });

    let a = document.createElement('a');
    a.className = 'uk-accordion-title';
    a.href = '#';
    a.innerText = '최신 버전 유지';

    let div = document.createElement('div');
    div.className = 'uk-accordion-content';
    div.innerHTML = '<p class="uk-text-meta">소피아를 최신버전으로 유지합니다. 업데이트 된 후 새로운 기능을 가장 먼저 경험하며, 개발자를 도울 수 있습니다.</p>';
    div.innerHTML += '<p class="uk-text-meta">가장 최신 버전은 <code>'+versions[0].replace(/-/g, '.')+'</code>입니다.</p>';

    li.appendChild(a);
    li.appendChild(div);
    vlist.appendChild(li);

    versions.forEach((version, idx) => {

        const ver = version.replace(/-/g, '.');        
        let nidx = notes.findIndex(note => note.ver === ver);
        if ( nidx === -1 ) {
            return;
        }
        const patchs = notes[nidx].patchs;

        let li = document.createElement('li');

        if ( sopia.config['version-fix'] && sopia.config.version === ver ) {
            li.className = "uk-open";
        }
        li.addEventListener('click', (evt) => {
            sopia.config['version-fix'] = true;
            if ( sopia.config.version != ver ) {
                sopia.config.reqVer = ver;
                window.settingChanged = true;
            }
        });

        let a = document.createElement('a');
        a.className = "uk-accordion-title";
        a.href = '#';
        a.innerText = ver;

        let div = document.createElement('div');
        div.className = 'uk-accordion-content';
        
        let ul = '';
        ul += '<ul class="uk-list uk-list-bullet">';
        patchs.forEach(patch => {
            ul += ` <li class="uk-text-meta">${patch}</li>`;
        });
        ul += '</ul>';

        div.innerHTML = ul;
        li.appendChild(a);
        li.appendChild(div);
        vlist.appendChild(li);
    });
}