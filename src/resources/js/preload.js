///////////////////////////////////////////////////////////////
//  파일 : preload.js                                        //
//  작성자 : mobbing                                         //
//  주석 : DOM이 로드되기 전 처리할 스크립트                 //
///////////////////////////////////////////////////////////////

// Native Package
const vm = require('vm');
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events');
const http = require('http');
const https = require('https');

// Download Package
const Sanilla = require('@sanillajs/sanilla').default;
const jsonMerger = require('json-merger');
const rimraf = require('rimraf');
const axios = require('axios');
const { app, dialog, process } = require('electron').remote;
const { clipboard, shell, ipcRenderer } = require('electron');

const orgRequire = require;

window.DEBUG_MODE = false;
process.argv.forEach((arg) => {
	if ( arg === "DEBUG" ) {
		let exePath = app.getPath('exe');
		let exe = path.basename(exePath);
		if ( exe.match("electron") ) {
			window.DEBUG_MODE = true;
		}
	}
});

//"yyyymmdd"
Date.prototype.yyyymmdd = function(flag_) {
	const flag = flag_ ? flag_ : "";
    const yyyy = this.getFullYear().toString();
    const mm = (this.getMonth()+1).toString();
    const dd  = this.getDate().toString();
    return `${yyyy}${flag}${mm[1] ? mm : 0+mm[0]}${flag}${dd[1] ? dd : 0+dd[0]}`; 
};

//"hhMMss"
Date.prototype.hhMMss = function(flag_) {
	const flag = flag_ ? flag_ : "";
    const hh = (this.getHours()).toString();
    const MM = (this.getMinutes()).toString();
    const ss = (this.getSeconds()).toString();
    return `${hh[1] ? hh : "0"+hh[0]}${flag}${MM[1] ? MM : "0"+MM[0]}${flag}${ss[1] ? ss : "0"+ss[0]}`;
};

/**
 * @function splice
 * @param {Number} index
 * @param {Number} count
 * index 부터 count 만큼을 제외한 문자열을 반환한다.
 */
String.prototype.splice= function(index, count) {
    // We cannot pass negative indexes directly to the 2nd slicing operation.
    str = this;
    if (index < 0) {
        index = str.length + index;
        if (index < 0) {
            index = 0;
        }
    }

    return str.slice(0, index) + str.slice(index + count);
};

/**
 * @function rMatch
 * @param {Number} limit
 * 글자수 제한이 걸릴 때 예쁘게 보이기 위하여
 * 넉넉하게 잡더라도 마지막 개행에서 끊는다.
 * from bboddolie
 */
String.prototype.rMatch = function(limit = 100) {
    const len = this.length;
    const m = parseInt(this.length-limit);
    for ( let i = len-m-1;i>0;i-- ) {
        //if ( this[i] === '\\' && this[i+1] === 'n' ) {
        if ( this[i] === '\n' ) {
            return i;
        }
    }
    return -1;
};

/**
 * @function getPath
 * @param {string} path_
 * 현재 프로그램이 시작된 경로를 기준으로,
 * @path_ 의 절대 경로를 반환한다.
 * @cur true 면 electron.exe 검사를 안 한다.
 */
const getPath = (path_, cur = false) => {
	let exePath = app.getPath('exe');
	let exe = path.basename(exePath);
	let p = app.getAppPath();
	if ( !exe.match("electron") && cur === false ) {
		p = path.dirname(exePath);
	}
	return path.join(p, path_);
};

/**
 * @function popPath
 * @param {string} path_
 * 현재 프로그램이 시작된 경로를 제외하고 반환한다
 */
const popPath = (path_) => {
	let exePath = app.getPath('exe');
	let exe = path.basename(exePath);
	let p = app.getAppPath();
	if ( !exe.match("electron") ) {
		p = path.dirname(exePath);
	}
	return path_.replace(p, '').replace(/^file\:\/\//, '');
};


/**
* @function AllSettingSave
* @param {Object} s [default sopia.config]
* @param {function} cb
* 소피아 설정을 config.json에 전체 저장한다.
*/
const AllSettingSave = (s = sopia.config, cb = null, mute = false) => {
	if ( typeof sopia.debug === "function" ) {
		sopia.debug(getPath('./config.json'));
	}
	fs.writeFile(getPath("./config.json"), JSON.stringify(s, null, '\t'), {encoding:'utf8'}, (err) => {
		if ( err ) {
			if ( !mute ) {
				noti.error(err);
			}
		}
		if ( typeof cb === "function" ) {
			cb();
		}
		if ( !mute ) {
			noti.success("성공", "설정을 저장했습니다.");
		}
	});
};

const fullStr2JSON = (str) => eval(`(function(){ return ${str} })()`);
const file2JSON = (file) => {
	if ( file ) {
		return fullStr2JSON(fs.readFileSync(file, {encoding:'utf8'}));
	}
};

// 사용자 컴퓨터의 UUID를 생성한다.
function generateUUID() {
	generateUUID.tail = generateUUID.tail || (function(nics) {
		var nic, index, addr, retn;
		for (nic in nics) { // try to obtain the MAC address from the IPv6 scope-local address
			for (index in nics[nic]) {
				addr = nics[nic][index];
				if (!addr.internal) {
					if (addr.address.indexOf('fe80::') === 0) { // found scope-local
						retn = retn || addr.address.slice(6).split(/:/).map(function(v, i, a) {
							return parseInt(v, 16);
						});
					}
				}
			}
		}
		if (!retn) { // no IPv6 so generate random MAC with multicast bit set
			index = Math.pow(2, 16);
			retn = [1, 2, 3, 4];
		}
		retn[3] = 0x10000 | retn[3];
		retn[2] = 0x10000 | retn[1] & 0xff00 | retn[2] & 0x00ff; // eliminate FFFE from xxxx:xxFF:FExx:xxxx
		retn[1] = 0x10000 | retn[0] ^ 0x0200; // invert bit#41
		retn = retn.map(function(v, i, a) {
			return v.toString(16).slice(1);
		});
		return retn[0] + '-' + retn[1] + retn[2] + retn[3];
	})(orgRequire('os').networkInterfaces());
	
	var head = [5, 6];
	return head.concat(generateUUID.tail).join('-');
}


// license 인증 확인
const checkLicenseSOPIA = () => {
	const config = orgRequire(getPath('/config.json'));
	if ( config.license && typeof config.license === "object" ) {
		let _axios = null;
		if ( typeof axios !== "undefined" ) {
			_axios = axios;
		} else {
			_axios = orgRequire('axios');
		}

		if ( typeof config.license.key !== "string" ) {
			// 정보 없음
			if ( !window.DEBUG_MODE ) {
				window.location.assign(`license.html?noti=인증데이터가 없습니다.`);
				sopia.error(err);
			}
			return;
		}

		let uuid = generateUUID();
		_axios({
			url: `${config['api-url']}/users/${config.license.key}.json`,
			method: 'get',
		}).then(res => {
			let data = res.data;
			if ( data && data.mac ) {
				if ( data.mac !== uuid ) {
					throw new Error('인증 정보 uuid와 PC의 uuid가 다릅니다.');
				}
			} else {
				throw new Error('인증데이터가 없습니다.');
			}
		}).catch(err => {
			// 인증 불가
			if ( !window.DEBUG_MODE ) {
				window.location.assign(`license.html?noti=${err.message}`);
				sopia.error(err);
			}
		});
	}
};
checkLicenseSOPIA();
//setInterval(checkLicenseSOPIA, 1000 * 60 * 1); // 1분 마다 한 번 라이센스 검사.

/**
* @function logging 
* @param {String} str
* 문자열로 받은 str을 console-output 에다가 추가를 한다.
*/
const logging = (str, lang = "javascript") => {
	let row = document.createElement('div');
	row.className = "row";
	let colLeft = document.createElement('div');
	colLeft.className = "col-12";
	
	let p = document.createElement('pre');
	p.className = "text-light";
	p.style = "overflow:hidden; white-space: pre-wrap;";
	
	let code = document.createElement('code');
	code.className = lang;
	code.innerText = str;
	
	hljs.highlightBlock(code);
	
	p.appendChild(code);
	colLeft.appendChild(p);
	row.appendChild(colLeft);
	document.querySelector('#console-output').appendChild(row);
	
	if (document.querySelector('#console-scroll-fix').checked) {
		document.querySelector('#console-output').scrollTop = 
		document.querySelector('#console-output').scrollHeight;
	}
};

/**
 * @type {Object}
 * 좌측 하단에 정보를 띄웁니다.
 */
const noti = {
	error : (errString, options = {}) => {
		const obj = {
			message: '<span uk-icon="icon: close"></span>&nbsp;'+
			'<label class="uk-text-small">에러 : <span class="uk-text-danger">' + errString + '</span></label>',
			pos: 'bottom-left',
		};

		const keys = Object.keys(options);
		keys.forEach(k => {
			obj[k] = options[k];
		});

		UIkit.notification(obj);
		console.error(errString);
	},
	success : (title, message, options = {}) => {
		const obj = {
			message: '<span uk-icon="icon: check"></span>&nbsp;'+
			`<label class="uk-text-small">${title} : <span class="uk-text-success">${message}</span></label>`,
			pos: 'bottom-left',
		};

		const keys = Object.keys(options);
		keys.forEach(k => {
			obj[k] = options[k];
		});

		UIkit.notification(obj);
	},
	info : (title, message, options = {}) => {
		const obj = {
			message: '<span uk-icon="icon: plus-circle"></span>&nbsp;'+
			`<label class="uk-text-small">${title} : <span class="uk-text-spoon">${message}</span></label>`,
			pos: 'bottom-left',
		};

		const keys = Object.keys(options);
		keys.forEach(k => {
			obj[k] = options[k];
		});

		UIkit.notification(obj);
	},
};

/**
 * @function readFolder
 * @param {string} path_
 * path_가 폴더라면 하위 폴더에 있는 내용까지 전부 탐색하여,
 * 결과값을 반환한다.
 */
const readFolder = (path_ = app.getAppPath()) => {
	let dir = fs.lstatSync(path_);
	let rtn = {files: [], folders: {}};
	if ( dir && dir.isDirectory() ) {
		let dirInfo = fs.readdirSync(path_);
		dirInfo.forEach(f => {
			let p = path.join(path_,f);
			let d = fs.lstatSync(p);
			if ( d && d.isDirectory() ) {
				rtn.folders[p] = readFolder(p);
			} else {
				rtn.files.push(p);
			}
		});
	}
	return rtn;
};

/**
 * @function copyAtag
 * @param {HTMLElement} element 
 * @param {boolean} skipFlag
 * A Tag의 텍스트를 복사한다.
 * skipFlag가 true면 왼쪽 아래의 메시지를 띄우지 않는다.
 */
const copyAtag = (element, skipFlag = false) => {
	let text = element.innerText;
	if ( text ) {
		clipboard.writeText(text);
		if ( !skipFlag ) {
			noti.info("복사되었습니다.", text);
		}
	}
};

const parseVersion = (ver) => {
	if ( typeof ver !== "string" ) return false;

	const sVer = ver.split('.');
	if ( sVer.length === 3 ) {
		return {
			app:   parseInt(sVer[0], 10),
			major: parseInt(sVer[1], 10),
			minor: parseInt(sVer[2], 10),
		};
	}
	return false;
};

/** 
 * @function verCompaire
 * @param {String} ver1
 * @param {String} ver2
 * @returns -1: ver1 < ver2 0: ver1 = ver2 1: ver1 > ver2
 */
const verCompaire = (ver1, ver2) => {
	const v1 = parseVersion(ver1);
	const v2 = parseVersion(ver2);
	
	if ( v1 === false || v2 === false ) return;
	
	if ( v1.app === v2.app ) {
		if ( v1.major === v2.major ) {
			if ( v1.minor === v2.minor ) {
				return 0;
			} else {
				return (v1.minor < v2.minor ? -1 : 1);
			}
		} else {
			return (v1.major < v2.major ? -1 : 1);
		}
	} else {
		return (v1.app < v2.app ? -1 : 1);
	}
};

const ToNumber = (num) => {
	switch ( typeof num ) {
		case 'number': return num;
		case 'boolean': return num ? 1 : 0;
		case 'string': return parseInt(num, 10) || 0;
		case 'function': return ToNumber(num()) || 0;
	}
	return 0;
};

const alertModal = (title, message) => {
	const alert = document.querySelector('#alert-modal');
	if ( alert ) {
		alert.querySelector('h2[name="title"]').innerText = title;
		alert.querySelector('pre[name="message"]').innerText = message;
		UIkit.modal(alert).show();
	}
};

const newAlertModal = (title, message) => {
	return new Promise((resolve) => {
		const id = Date.now().toString();
		const modal = `	<div id="dom-${id}" class="uk-flex-top" uk-modal="bg-close: false;">
				<div class="uk-modal-dialog uk-margin-auto-vertical">
					<button class="uk-modal-close-default" type="button" uk-close></button>
					<div class="uk-modal-header uk-background-sopia">
						<h2 class="uk-modal-title uk-text-white">${title}</h3>
					</div>
					<div class="uk-modal-body">
						<span class="uk-text-emphasis">${message}</span>
					</div>
				</div>
			</div>`;

		document.body.innerHTML += modal;
		UIkit.util.on('#dom-' + id, 'hide', () => {
			setTimeout(() => {
				document.querySelector('#dom-' + id).remove();
				resolve();
			}, 1000);
		});
		UIkit.modal('#dom-' + id).show();
	});
};

/**
 * NavBar의 사이즈를 panel의 크기에 맞게 재정비한다.
 * +++ codeDiv 의 사이즈도 맞춘다.
 */
const refreshNavSize = () => {
	let nav = document.querySelector('nav');
	let panel = document.querySelector('#ContainerPanel>div[name="panel1"]');

	if ( nav && panel ) {
		nav.style.width = panel.offsetWidth+"px";
	}

	let codeDiv = document.querySelector('#codeDiv');
	if ( codeDiv ) {
		codeDiv.style.width = (panel.offsetWidth - 200)+"px";
	}
};

/**
 * appendImport 는 부모가 될 HTMLElement에,
 * @target 으로 넘겨준 선택자 또는 HTMLElement 를 이용하여, import 태그를 찾는다.
 * 찾으면, 해당 태그 안 import-child div 를 부모 노드에 appendChild로 추가한다.
 */
HTMLElement.prototype.appendImport = function(target, query, cb) {
	if ( typeof query === "function" ) {
		cb = query;
	}

	if ( typeof query !== "string" ) {
		query = 'div[name="import-child"]';
	}

	let t = target;
	if ( typeof target === "string" ) {
		t = document.querySelector(target);
	}
	
	let child = null;
	if ( t.rel === 'import' ) {
		child = t.import.querySelector(query);
		if ( child ) {
			//child = child.cloneNode(true);
			this.appendChild(child);
		}
	}

	if ( typeof cb === "function" ) {
		cb(this, child);
	}
};

/**
 * @function htmlToElements
 * html문자열을 HTMLElement 타입으로 변환하여 반환한다.
 */
String.prototype.htmlToElements = function() {
	let dummy = document.createElement('div');
	dummy.innerHTML = this;
	return dummy;
};

/**
 * @function getObject
 * @param {String} key
 * '.' 를 기준으로 key 하위 오브젝트를 한 번에 반환한다.
 */
const getObject = (obj, key, midx=0, rtn = obj) => {
	if ( Array.isArray(key) ) {
		if ( rtn === undefined || key.length-midx <= 0 ) {
			if ( key.length > 0 ) {
				return {d: rtn, k: key[0]};
			}
			return rtn;
		} else {
			rtn = rtn[key.shift()];
			if ( rtn === undefined ) {
				return undefined;
			}
		}
	} else if ( typeof key === "string" ) {
		key = key.split('.');
	}
	return getObject(obj, key, midx, rtn);
};

const checkObject = (obj) => {
	if ( obj && typeof obj === 'object' ) {
		try {
			JSON.stringify(obj);
			return true;
		} catch {
		}
	}
	return false;
}

/**
 * @function fullStringify
 * @param {Object} obj 문자열화 할 객체
 * @param {String} rtn 사용되지 않음
 * @description 오브젝트 전체를 문자열화 하여 보여준다.
 * 함수, 그 안에 있는 객체까지도.
 */
const fullStringify = (obj, deep = 0) => {
	let rtn = '';
	const indent = '\t'.repeat(deep);
	if ( Array.isArray(obj) ) {
		rtn += '[\n';
		const len = obj.length;
		for ( let i=0;i < len; i++ ) {
			const val = obj[i];
			let comma = '';
			if ( i < len - 1 ) {
				comma = ',';
			}

			rtn += indent + '\t' + fullStringify(val, deep + 1) + `${comma}\n`;
		}
		rtn += indent + ']';
	} else if ( checkObject(obj) ) {
		rtn += '{\n';
		const keys = Object.keys(obj);
		const len = keys.length;
		for ( let i=0;i < len;i ++ ) {
			const key = keys[i];
			const val = obj[key];
			let comma = '';
			if ( i < len - 1 ) {
				comma = ',';
			}

			rtn += indent + '\t' + `"${key}": ${fullStringify(val, deep + 1)}${comma}\n`;
		}
		rtn += indent + '}';
	} else {
		switch ( typeof obj ) {
			case 'object':
				if ( obj === null ) {
					rtn += 'null';
				} else {
					rtn += obj.toString();
				}
				break;
			case 'undefined':
				rtn += 'undefined';
				break;
			case 'string':
				let quotes = '"';
				if ( obj.match(/^raw:/) ) {
					obj = obj.replace(/^raw:/, '');
					quotes = '';
				} else {
					obj = obj.replace(/\\/g, '\\\\')
					.replace(/\n/g, '\\n')
					.replace(/\t/g, '\\t')
					.replace(/\r/g, '\\r');
				}
				rtn += `${quotes}${obj}${quotes}`;
				break;
			default:
				rtn += obj.toString();
		}
	}

	return rtn;
};

/**
 * @function jsSyntax
 * @param {String} 에러 검사할 코드
 * @description JS 문법을 검사한다.
 */
const jsSyntax = (code, fullJSON = false) => {
	try {
		if ( fullJSON ) {
			code = `(function(){\nreturn ${code}\n;})()`;
		}
		const v = vm;
		v.createScript(code);
		return { result: true };
	} catch (err) {
		const sp = err.stack.split('\n');
		const line = parseInt(sp[0].split(':')[1], 10) - 1;
		const syntax = `${sp[1].replace(/^return /, '')}\n${sp[2].substr(3)}`;
		return {
			result: false,
			msg: sp[4],
			syntax,
			line,
			stack: err.stack,
		};
	}
}

const bundleList = {};

const routingPage = (target) => {
	document.querySelectorAll('#controls>div').forEach(import_ => {
		//보일 것은 display: table 로, 아닌 것은 숨긴다.
		if ( import_.getAttribute('data-target') && target.getAttribute('value') &&
			import_.getAttribute('data-target').toLowerCase && target.getAttribute('value').toLowerCase ) {
			if ( import_.getAttribute('data-target').toLowerCase() === target.getAttribute('value').toLowerCase() ) {
				if ( import_.getAttribute('data-target').toLowerCase() === "code" ) {
					import_.style.overflow = "hidden";
					document.querySelector('#controls').style.overflow = "hidden";
				} else {
					import_.style.overflow = "auto";
					document.querySelector('#controls').style.overflow = "auto";
				}
				import_.style.display = "table";
				if ( import_ ) {
					if ( typeof import_.onload === 'function' ) {
						import_.onload();
					}
				}
			} else {
				import_.style.display = "none";
			}
		}

		//active class 설정
		document.querySelectorAll('ul.uk-navbar-nav>li>a').forEach(a => {
			let li = a.parentNode;
			if ( target.getAttribute('value') === a.getAttribute('value') ) {
				li.classList.add("uk-active");
			} else {
				li.classList.remove("uk-active");
			}
		});
	});
}
const loadCustomPage = () => {
	const drop = document.querySelector('#custom-pages-dropdown');
	if ( !drop ) {
		return;
	}
	drop.innerHTML = '';

	for ( const [bundle, dir] of Object.entries(sopia.config.bundle) ) {
		console.log(bundle);
		const bundlePath = getPath(dir);
		const target = path.join(bundlePath, 'index.html');
		if ( !fs.existsSync(target) ) {
			continue;
		}

		const html = fs.readFileSync(target, { encoding: 'utf8' });

		const li = document.createElement('li');
		const a = document.createElement('a');
		a.href = '#';
		a.addEventListener('click', (evt) => {
			Sanilla.mount('#otherTable', html);
			routingPage(document.querySelector('#other-tab'));
		});
		a.innerText = bundle.toUpperCase();

		li.appendChild(a);
		drop.appendChild(li);
	}


}
/**
 * @function loadScript
 * @param {function} callback 스크립트가 로딩된 후 실행될 함수
 * @description sopia 프로젝트의 main.js 를 로딩한다.
 */
const loadScript = (callback) => {
	let script = document.querySelector('#sopia-main');
	if ( script ) {
		script.remove();
		script = null;
	}

	sopia.removeAllListeners();
	Object.keys(sopia.itv).forEach(key => sopia.itv.reload(key));

	script = document.createElement('script');
	script.id = "sopia-main";
	script.src = getPath('sopia/main.js');
	script.type = "text/javascript";


	script.onload = () => {
		if ( typeof callback === "function" ) {
			callback();
		}

		// bundle
		if ( typeof sopia.config.bundle === "object" ) {
			let keys = Object.keys(sopia.config.bundle);
			keys.forEach((k) => {
				const bundle = sopia.config.bundle[k];
				const bundlePath = getPath(path.join(bundle, 'index.js'));

				let bscript = document.querySelector('#' + k);
				if ( bscript ) {
					bscript.remove();
					bscript = null;
				}

				bscript = document.createElement('script');
				bscript.id = k;
				bscript.src = bundlePath;
				bscript.type = "text/javascript";
				bscript.onload = () => {
					sopia.debug("bundle init", bundlePath);
				};

				document.body.appendChild(bscript);
			});

			loadCustomPage();
		}
	};

	document.body.appendChild(script);
};


const logDirPath = getPath('./logs');
if ( !fs.existsSync(logDirPath) ) {
	fs.mkdirSync(logDirPath);
}

const now = new Date();
const logFilePath = path.join(logDirPath, `${now.yyyymmdd()}-${now.hhMMss()}.log`);

fs.writeFileSync(logFilePath, `~~~~~~~~~~~~~~~~~~ Created ${path.basename(logFilePath)} ~~~~~~~~~~~~~~~~~~\r\n`, { encoding: 'utf8' });

const writeLog = (level, ...args) => {
	const time = new Date().hhMMss(':');
	fs.appendFileSync(logFilePath, `[${time}] [${level}] ${args.join(', ')}\r\n`, { encoding: 'utf8' });
};

//sopia 객체 로딩
window.speech = require(getPath('./src/resources/js/speech.js', true));
writeLog('INFO', 'speech module import done.');
window.sopia = require(getPath('./src/resources/js/sopia.js', true));
sopia.wlog('INFO', 'sopia module import done.');

// 디버그용 함수. 메시지를 발생시킨다.
const sopiaCreateMessage = (msg) => {
	let obj = {
		event: "live_message",
		data: {
			message: msg
		}
	};
	sopia.onmessage(obj);
};

const injectPath = getPath('./sopia/inject/');
window.INJECTORS = [];
if ( fs.existsSync(injectPath) ) {
	const scripts = fs.readdirSync(injectPath);
	scripts.forEach((scr) => {
		INJECTORS.push(require(path.join(injectPath, scr)));
	});
	INJECTORS.forEach((injector) => injector.preload());
}

window.addEventListener('error', (err) => {
	sopia.wlog('ERROR', `${err.error.message} -> ${popPath(err.filename)}:${err.lineno}`);
});
