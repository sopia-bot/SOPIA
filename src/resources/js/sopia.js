////////////////////////////////////////////////////////////////
//  파일 : sopia.js                                           //
//  작성자 : mobbing                                          //
//  주석 : sopia 객체를 생성하는 스크립트                       //
///////////////////////////////////////////////////////////////

/**
 * @sopia 의 객체를 생성한다.
 * 기본적으로 EventEmitter을 사용하여 스푼에서 받은 이벤트를 처리한다.
 * sopia.storage 에선 sopia.storage.save 함수를 사용하지 않는 한, sopia 재시작시 수정된 변수값을 초기화한다.
 * sopia.var은 프로그램 재시작 전까진 값을 가지고 있는다.
 */
const sopia = new EventEmitter();

sopia.var = new Object();
sopia.storage = {
	/**
	 * @function save
	 * @param {String} key 
	 * key가 있으면 해당 키값에 해당하는 변수만 저장한다.
	 * 없으면 전체 storage를 저장한다.
	 */
	save: function(key) {
		if ( key ) {
			let { d, k } = getObject(this.ori, key, 1);
			delete this.ori;
			let m = getObject(this.data, key);
			d[k] = m;
			let s = fullStringify(d);
			fs.writeFile(getPath('storage', s, {encoding:'utf8'}), err => {
				if ( err ) {
					noti.error(err);
				}
			});
		} else {
			delete this.ori;
			let s = fullStringify(this.data);
			fs.writeFile(getPath('storage', s, {encoding:'utf8'}), err => {
				if ( err ) {
					noti.error(err);
				}
			});
		}
	},
	/**
	 * @function get
	 * @param {String} key 
	 * key가 있으면 해당 키값에 해당하는 변수를 반환한다.
	 * 없으면 전체 storage를 반환한다.
	 */
	get: function(key) { 
		if ( key ) {
			return getObject(this.data, key);
		}
		return this.data;
	},
	/**
	 * @function set
	 * @param {String} key 
	 * @param {*} val
	 * 해당 키값에 value를 할당한다.
	 */
	set: function(key, val) {
		try {
			if ( key && val !== undefined ) {
				let { d, k } = getObject(this.data, key, 1);
				d[k] = val;
			}
			return this.data;
		} catch {
			return false;
		}
	},
	ori: require(getPath('storage.json')),
	data: require(getPath('storage.json'))
};

/**
 * 소피아의 반복 동작 (interval)을 관리합니다.
 * sopia.itv.add 로 관리대상을 추가할 수 있고,
 * sopia.itv.clear 로 관리대상을 삭제할 수 있습니다.
 */
sopia.itv = {
	add: function(key, func, itv) {
		if (this[key]) {
			return false;
		}
		this[key] = {
			f: func,
			itv: setInterval(func, itv)
		};
	},
	clear: function(key) {
		if ( this[key] ) {
			clearInterval(this[key].itv);
			delete this[key];
		}
	}
};
sopia.require = require;

/**
 * @function import
 * @param {String} path_
 * sopia 프로젝트 폴더 안에 있는 모듈을 로딩할 때 사용한다.
 */
sopia.import = (path_) => {
	return sopia.require(getPath(path.join(window.code.sopiaPath,path_)));
};
/**
 * @function include
 * @param {String} path_
 * sopia 프로젝트 폴더 안에 있는 스크립트 파일을 실행할 때 사용한다.
 */
sopia.include = (path_) => {
	let file = getPath(path.join(window.code.sopiaPath, path_));
	if ( fs.existsSync(file) ) {
		let source = fs.readFileSync(file, {encoding: 'utf8'});
		eval(source);
	} else {
		// file not exists
	}
};

//설정파일 로딩
sopia.config = require(getPath('./config.json'));



/**
* @function sopia.error
* @param {UserException} obj
* try ... catch 로 받은 error 을 출력한다.
*/
sopia.error = (obj) => {
	logging(`${obj.name} : ${obj.message}`);
};

/**
* @function sopia.log
* @param {*} obj
* @param {String} cmd
* console.log 와 비슷한 기능
*/
sopia.log = (obj, cmd = null) => {
	let code = "";
	let flag = true;
	let lang = "javascript";
	if ( typeof obj === "object" ) {
		code += JSON.stringify(obj, null, '\t');
		flag = false;
	} else if ( typeof obj === "string") {
		if ( cmd ) {
			if ( obj.match(/\[object \w+\]/) ) {
				let s = obj.replace(/\W+\[object\ /, "").replace(/\]$/, "");
				switch (s.toLowerCase()) {
					case "object": {
						code += eval(`JSON.stringify(${cmd}, null, '\t');`);
						flag = false;
					} break;
				}
				if ( s.toLowerCase().match(/html.*element/)) {
					code += eval(cmd).outerHTML;
					flag = false;
					lang = "html";
				}
				
				if ( flag ) {
					//예외처리 안 된 항목
					console.log(s);
				}
			}
		}
	}
	
	if ( flag ) {
		code += obj + "";
	}
	
	logging(code, lang);
};

///////////////////////////////////////////////////////////////////
//                             live                              //
///////////////////////////////////////////////////////////////////

/**
 * @function send
 * @param {String} data
 * 
 * 라이브에서 채팅을 보낸다.
 * 5초 이내에 채팅을 5번 이상 보내게 된다면, 그로부터 5초는 쉰다.
 */
sopia.send = (data) => {
	
	webview.executeJavaScript(`SendChat(\`${data.replace(/\`/g, "\\\`").replace(/\$/g, "\\$")}\`);`);
};

module.exports = sopia;