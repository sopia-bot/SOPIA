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

sopia.modules = {
	axios: require('axios'),
	path: require('path'),
	fs: require('fs'),
};

sopia.tts = require(getPath('/speech.js')).tts;

sopia.var = new Object();
sopia.storage = {
	/**
	 * @function save
	 * @param {String} key 
	 * @param {String} file
	 * key가 있으면 해당 키값에 해당하는 변수만 저장한다.
	 * 없으면 전체 storage를 저장한다.
	 */
	save: function(key) {
		let file = "";
		try {
			if ( key ) {
				let m = getObject(this.data, key);
				
				
				if ( typeof m["__loaded_file__"] === "string" ) {
					//해당 json만 저장해야함.
					file = m["__loaded_file__"];
					delete m["__loaded_file__"];
					let s = fullStringify(m);
					fs.writeFile(file, s, {encoding:'utf8'}, err => {
						if ( err ) {
							noti.error(err);
						}
					});
					m["__loaded_file__"] = file;
				}
			} else {
				let OriClone = Object.assign(this.ori);
				delete this.ori;
				Object.keys(this.data).forEach(k => {
					if ( typeof this.data[k]["__loaded_file__"] === "string" ) {
						this.save(k);
					}
				});
				this.ori = OriClone;
			}
		} catch (err) {
			console.error(err);
		}
	},
	/**
	 * @function get
	 * @param {String} key 
	 * key가 있으면 해당 키값에 해당하는 데이터를 삭제한다.
	 */
	delete: function(key) {
		if ( key ) {
			let { d, k } = getObject(this.data, key, 1);
			delete d[k];
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
			let rtn = getObject(this.data, key);
			if ( rtn === undefined && this.data.default ) {
				rtn = getObject(this.data.default, key);
			}
			return rtn;
		}
		return this.data;
	},
	/**
	 * @function set
	 * @param {String} key 
	 * @param {*} val
	 * 해당 키값에 value를 할당한다.
	 */
	set: function(key, val, obj = this.data) {
		try {
			if ( key && val !== undefined ) {
				let o = getObject(obj, key, 1);
				if ( o === undefined && obj.default ) {
					let { d, k } = getObject(obj.default, key, 1)
					d[k] = val;
				} else {
					let { d, k } = o;
					d[k] = val;
				}
			}
			return this.data;
		} catch (err) {
			console.error(err);
			return false;
		}
	},
	/**
	 * @function load
	 * @param {String} key 
	 * @param {String} file
	 * file 을 읽어, this.data.key 값에 로딩을 한다.
	 */
	load: function(key, file) {
		if ( typeof key === "string" && typeof file === "string" ) {
			if ( fs.existsSync(file) ) {
				fs.readFile(file, {encoding:'utf8'}, (err, data) => {
					if ( err ) {
						noti.error(err);
						return;
					}

					let j = file2JSON(file);
					
					this.set(key, j, this.ori);
					j["__loaded_file__"] = file;
					this.set(key, j);
				});
			} else {
				if ( fs.existsSync(path.join("./sopia", file)) ) {
					this.load(key, path.join("./sopia", file));
				} else {
					try { 
						noti.error("["+file+"] 파일이 없습니다.")
					} catch (err) {
						console.log("cannot find file", file);
						console.error(err);
					}
				}
			}
		}
	},
	data: {},
	ori: {}
};

sopia.storage.load('default', getPath('default.json'));

/**
 * 소피아의 반복 동작 (interval)을 관리합니다.
 * sopia.itv.add 로 관리대상을 추가할 수 있고,
 * sopia.itv.clear 로 관리대상을 삭제할 수 있습니다.
 */
sopia.itv = {
	add: function(key, func, time) {
		if (this[key]) {
			return false;
		}
		this[key] = {
			f: func,
			t: time,
			itv: setInterval(func, time)
		};
	},
	clear: function(key) {
		if ( this[key] ) {
			clearInterval(this[key].itv);
			delete this[key];
		}
	},
	reload: function(key) {
		if ( this[key] ) {
			clearInterval(this[key].itv);
			this[key].itv = setInterval(this[key].f, this[key].t);
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
		return eval(source);
	} else {
		// file not exists
		noti.error(`[${file}] 파일을 열 수 없습니다.`);
	}
};

//설정파일 로딩
sopia.config = sopia.require(getPath('./config.json'));



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
					sopia.debug(s);
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

sopia.is_on = false;		//현재 소피아가 !on 된 상태인가.
sopia.isLoading = false;	//스크립트가 로딩되었는가.

sopia.var.canSend = true;	//소피아가 채팅을 보낼 수 있는 상태인가.
sopia.var.sendCount = 0;
sopia.var.sendMaxCount = 5;
sopia.var.sendIntervalTime = 5000;
sopia.var.sendTimeoutTime = 5000;
sopia.itv.add("sendInterval", () => {
	sendCount = 0;
});

/**
 * @function send
 * @param {String} data
 * 
 * 라이브에서 채팅을 보낸다.
 * 5초 이내에 채팅을 5번 이상 보내게 된다면, 그로부터 5초는 쉰다.
 */
sopia.send = (data) => {
	if ( data.trim() === "" ) {
		return;
	}

	if ( sopia.var.sendCount >= sopia.var.sendMaxCount ) {
		sopia.var.canSend = false;
		sopia.var.sendDelayTimeout = setTimeout(() => {
			sopia.var.canSend = true;
		}, sopia.var.sendTimeoutTime);
	} else {
		if ( sopia.var.canSend ) {
			const chat = data.replace(/\`/g, "\\\`").replace(/\$/g, "\\$");
			webview.executeJavaScript(`SendChat(\`${chat}\`);`);
		}
	}
};

/**
 * @function isManager
 * @param {Object,Number} id
 * 
 * 해당 사용자가 매니저인 상태인지 검사한다.
 */
sopia.isManager = (id) => {
	if ( typeof id === "object" ) {
		if ( id.id ) {
			id = id.id;
		}
	}

	if ( sopia.live && Array.isArray(sopia.live.manager_ids) && Number.isInteger(id) ) {
		return sopia.live.manager_ids.includes(id);
	}
	return false;
};

sopia.me = null;

sopia.debug = () => {};
sopia.error = () => {};

// spoor chat 관리
sopia.ttsStackUser = [];
sopia.ttsStack = [];
sopia.isRunTTS = false;
sopia.itv.add('spoorchat', () => {
	// tick check
	sopia.ttsStack.forEach((t, idx) => {
		if ( t.tick++ > sopia.config.spoor.toutspoor ) {
			sopia.ttsStack.splice(idx, 1); // delete
		}
	});

	if ( sopia.ttsStack.length > 0 ) {
		if ( sopia.isRunTTS ) return;

		// play tts
		sopia.isRunTTS = true;

		let fs = sopia.modules.fs;
		let chatData = sopia.ttsStack.shift();
		fs.readFile(getPath('/media/SpoorChatNoti.mp3'), { encoding: 'base64' }, (err, data) => {
			if ( err ) {
				sopia.error(err);
				sopia.isRunTTS = false;
				return;
			}

			let voiceType = sopia.config.spoor.type;
			let notiSnd = new Audio("data:audio/mp3;base64," + data);
			notiSnd.volume = (sopia.config.spoor.effectvolume * 0.01) || 0.5;
			notiSnd.onpause = function() {
				sopia.tts(chatData.message, voiceType).then(res => {
					let spoorChatSnd = new Audio(res);
					spoorChatSnd.volume = (sopia.config.spoor.ttsvolume * 0.01) || 1;
					spoorChatSnd.onpause = () => {
						sopia.isRunTTS = false;
						spoorChatSnd.remove();
					};
					spoorChatSnd.play();
					noti.info('SpoorChat', chatData.message);
				});
				notiSnd.remove();
			};
			notiSnd.play();
		});

		// spoor logging
		// replay가 아니라면 추가.
		if ( !chatData.replay ) {
			if ( typeof spoorLog === 'function' ) {
				spoorLog(chatData);
			}
		}
	}
}, 1000);

const nextTick = [];

/**
 * @function onmessage
 * @param {Object} e 라이브 이벤트
 * @description 라이브 이벤트를 받으면 main_process로 넘겨주는 함수
 * HOME의 라이브 정보 갱신도 한다.
 */
sopia.onmessage = (e) => {
	try {
		let data = e.data;

		if ( nextTick.length > 0 ) {
			let func = nextTick.shift();
			if ( typeof func === "function" ) {
				func(e);
			}
		}

		if ( !sopia.me || !sopia.me.tag ) {
			if ( e.event.trim() === "live_join" ) {
				sopia.me = data.author;
				nextTick.push(function(e) {
					let data = e.data;
					sopia.me = data.author;
				});
			}
		} else {
			// sopia.me 가 존재할 때
			if ( sopia.me.tag !== sopia.config.license.id ) {
				// 라이센스 id 와 로그인 한 id가 다르다면,
				window.location.assign('license.html?noti=로그인 한 계정과 인증 계정이 다릅니다.');
			}
		}

		let send_event = true;
		if ( !sopia.config.sopia.detectme &&
			e.data.author.tag === sopia.me.tag ) {
			//detectme then, not send data sopia
			send_event = false;
		}
		
		e.event = e.event.replace("live_", "").trim();

		if ( data.live && e.event !== "message" ) {
			sopia.live = data.live;
		} else if ( e.event === "message" ) {
			// spoorchat
			let idx = sopia.ttsStackUser.indexOf(data.author.id);
			if ( idx >= 0 ) {
				sopia.ttsStackUser.splice(idx, 1);
				sopia.ttsStack.push({
					message: data.message,
					tick: 0
				});
			}
		}

		if ( sopia.is_on === false && send_event ) {
			if ( sopia.config.sopia.autostart ) {
				send_event = true;
			}
		}
		
		if ( ["join", "leave", "like", "present"].includes(e.event) ) {
			sopia.debug("is manager event!");
			sopia.debug("only manager ", sopia.config.sopia.onlymanager)
			if ( sopia.config.sopia.onlymanager === true ) {
				sopia.debug(sopia.live.manager_ids, sopia.me.id, sopia.live.manager_ids.includes(sopia.me.id));
				if ( sopia.live.manager_ids.includes(sopia.me.id) == false &&
					 send_event ) {
					send_event = false;
				}
			}

			if ( e.event === "join" ) {
				if ( ["02x26n"].includes(data.author.tag) ) {
					sopia.send("어서오십시오. 주인님.");
					send_event = false;
				}
			}
		}

		if ( sopia.isLoading === false ) {
			sopia.isLoading = true;
			loadScript(() => {sopia.onmessage(e)});
		}

		sopia.debug("send event", send_event);
		if ( send_event === true ) {
			sopia.debug('event', e.event)
			sopia.emit(e.event, data);
		}
		sopia.emit('all', e);

		//라이브 정보
		if ( data && data.live && e.event !== "message" ) {
			let live = data.live;
			document.querySelector('#liveTitle').innerText = live.title;
			document.querySelector('#liveStartTime').innerText = new Date(live.created).toLocaleString();
			document.querySelector('#liveBgUrl').innerText = live.img_url;

			//비제이 정보
			if ( live.author ) {
				let author = live.author;
				document.querySelector('#bjName').innerText = author.nickname;
				document.querySelector('#bjTag').innerText = author.tag;
				document.querySelector('#bjPID').innerText = author.id;
				document.querySelector('#bjProfileUrl').innerText = author.profile_url;
				document.querySelector('#bjDateJoined').innerText = 
					new Date(author.date_joined).toLocaleString();
			}
		}

		// spoor chat
		if ( sopia.config.spoor.enable && e.event === "present" ) {
			if ( (data.amount * data.combo) >= sopia.config.spoor.minspoon ) {
				sopia.ttsStackUser.push(data.author.id);
			}
		}

	} catch ( err ) {
		sopia.error(err, e);
	}
}

module.exports = sopia;
