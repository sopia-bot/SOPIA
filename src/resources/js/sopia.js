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

sopia.tts = require(getPath('/speech.js'));

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
	 * @function delete
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

sopia.msgQ = [];
/**
 * @function send
 * @param {String} msg 
 * 
 * 라이브에서 채팅을 보낸다.
 * 이 함수는 Message Queue 만 담아두며, 실제 전송하는 것은 sopia.RealMessageSend 에서 다룬다.
 * from bboddolie
 */
sopia.send = (msg) => {
	if ( typeof msg === "string" ) {
		if ( msg.length > 0 ) {
			const limit = 100;
			sopia.debug("=============== sopia send ===============");
			if ( sopia.config.sopia.limitoff === true ) {
				while ( msg.length > 0 ) {
					if ( msg.length > limit ) {
						const ridx = msg.rMatch(limit);
						const l = (ridx !== -1) ? ridx : limit;
						const m = msg.substring(0, l);

						sopia.debug(`message push ${m}`);
						sopia.msgQ.push(m);
						msg = msg.splice(0, l);
					} else {
						sopia.debug(`message last push ${msg}`);
						sopia.msgQ.push(msg);
						msg = "";
					}
				}
			} else {
				const smsg = msg.substring(0, limit);
				sopia.debug(`limit_off is ${sopia.config.sopia.limitoff}.\npush message ${smsg}`);
				sopia.msgQ.push(smsg);
			}
			sopia.RealSendChat();
		}
	}
};

sopia.isSending = false;
sopia.RealSendChat = () => {
	if ( sopia.isSending === false ) {
		sopia.isSending = true;
		while ( sopia.msgQ.length > 0 ) {
			//let msg = ws.msgQ.shift().toString().trim().replace(/^\n+|\n+$/g, "").replace(/\"/g, "\\\"");
			const msg = sopia.msgQ.shift().trim().replace(/\`/g, "\\\`").replace(/\$/g, "\\$").replace(/\./g, "\\.");
			if ( typeof msg === "string" && msg.length > 0 ) {
				//sopia.send(msgData);
				//const chat = data.replace(/\`/g, "\\\`").replace(/\$/g, "\\$");
				sopia.debug("real send chat", msg);
				webview.executeJavaScript(`SendChat(\`${msg}\`);`);
			}
		}
		sopia.isSending = false;
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

const ttsMessgeWrapper = (str) => {
	return str.toString().
		replace(/\\/g, "").
		replace(/\./g, "").
		replace(/\+/g, "+").
		replace(/\n/g, " ").
		replace(/\ /g, "");
};

sopia.me = null;

sopia.debug = () => {};
sopia.error = () => {};

// spoor chat 관리
sopia.tts.user = [];
sopia.tts.stack = [];
sopia.tts.isrun = false;
sopia.tts.signature = {};
sopia.tts.parser = (tts = "", signature = []) => {
	if ( signature.length <= 0 ) return [ tts ];

	tts = ttsMessgeWrapper(tts);

	let reStr = "(";
	signature.forEach((s) => {
		let or = "";
		if ( reStr.length > 1 ) {
			or = "|";
		}
		reStr += `${or}${s.replace(/(\(|\))/g, "\\$1")}`;
	});
	reStr += ")";

	sopia.debug("tts signature parser", reStr);
	const re = new RegExp(reStr);
	return tts.split(re);
};

sopia.itv.add('spoorchat', () => {
	// tick check
	sopia.tts.user.forEach((t, idx) => {
		if ( t.tick++ > sopia.config.spoor.toutspoor ) {
			const deletedItem = sopia.tts.user.splice(idx, 1); // delete
		}
	});

	if ( sopia.tts.stack.length > 0 ) {
		// mutex
		if ( sopia.tts.isrun ) return;

		// play tts
		sopia.tts.isrun = true;

		const fs = sopia.modules.fs;
		const chatData = sopia.tts.stack.shift();
		sopia.debug("============= Spoor Chat =============");
		fs.readFile(getPath('/media/SpoorChatNoti.mp3'), { encoding: 'base64' }, (err, data) => {
			if ( err ) {
				sopia.error(err);
				sopia.tts.isrun = false;
				return;
			}

			let voiceType = sopia.config.spoor.type;
			const notiSnd = new Audio("data:audio/mp3;base64," + data);
			notiSnd.volume = (sopia.config.spoor.effectvolume * 0.01);
			notiSnd.onpause = function() {
				const sigKeys = Object.keys(sopia.config.spoor.signature);
				const argv = sopia.tts.parser(chatData.message, sigKeys);
				const readStack = new Array(argv.length);
				sopia.debug(argv);

				// select voice type
				if ( voiceType === "random" ) {
					let voiceList = Object.keys(sopia.tts.voices);
					let idx = Math.floor(Math.random() * (voiceList.length));
					
					voiceType = voiceList[idx];
				}
				
				if ( Array.isArray(argv) ) {
					// make sound array
					argv.forEach((arg, idx) => {
						let sigFile = sopia.config.spoor.signature[arg];
						if ( sigFile ) {
							// has signature
							sopia.debug("signature! ", sigFile);
							const buf = fs.readFileSync(sigFile);
							if ( path.extname(sigFile) === '.base64' ) {
								readStack[idx] = buf.toString('utf8');
							} else {
								readStack[idx] = buf.toB64Str();
							}
						} else {
							if ( arg.trim() !== "" ) {
								sopia.debug("Run tts", arg.trim());


								sopia.tts.read(arg.trim(), voiceType).then(buf => {
									if ( !readStack.includes(buf) ) {
										readStack[idx] = buf;
									} else {
										// 이전과 동일한 tts로 나올 시 1회만 더 실행
										sopia.debug("I find matched file. 1 time retry. idx", idx);
										sopia.tts.read(arg.trim(), voiceType).then(buf => {
											sopia.debug("success get buf. idx", idx);
											readStack[idx] = buf;
										});
									}
								});
							} else {
								readStack[idx] = "no run";
							}
						}
					});

					// read all array
					let speechRun = false;
					let noRuned = false;
					let speechIdx = 0;
					let speechItv = setInterval(() => {
						if (  speechRun === false ) {
							speechRun = true; // mutex
							if ( speechIdx < readStack.length ) {
								if ( readStack[speechIdx] === "no run" ) {
									noRuned = true;
									speechRun = false;
									speechIdx++;
								} else if ( readStack[speechIdx] ) {
									let b64snd = readStack[speechIdx];
									let spoorChatSnd = new Audio(b64snd);
									spoorChatSnd.onpause = () => {
										speechRun = false;
										speechIdx++;
										spoorChatSnd.remove();
									};
									spoorChatSnd.volume = (sopia.config.spoor.ttsvolume * 0.01);
									spoorChatSnd.play();

									sopia.tts.stop = () => {
										readStack.splice(0, readStack.length);
										spoorChatSnd.pause();
									};
								} else {
									speechRun = false;
									if ( noRuned && !readStack[speechIdx] ) {
										noRuned = false;
										speechIdx++;
									}
								}
							} else {
								clearInterval(speechItv);
								sopia.tts.isrun = false;
								readStack.splice(0, readStack.length);
								sopia.debug('speech finish');
								sopia.tts.stop = null;
								document.querySelectorAll('a[name="play-pause"]').forEach((element) => {
									element.style = "display: none";
								});
							}
						}
					}, 100); // thick 1ms
				}

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

/** 
 * @function devMessage
 * @param {Object} data 라이브 데이터
 * @param {String} event 이벤트 타입
 * @description 개발자 전용 메시지 및 명령어 관리
 * @returns {Boolean} send_chat 
 */
const devMessage = (data, event) => {
	let rtn = true;
	let isDeveloper = false;
	const e = Object.assign({}, data);
	
	sopia.debug("================ dev message check ================");
	sopia.debug("data", data, "event", event);

	
	if ( e.author === undefined ) {
		sopia.debug("data is author not have");
		return rtn;
	}

	if ( sopia.app.admins.includes(e.author.tag) ) {
		isDeveloper = true;
		sopia.debug("he is developer!!");
	}

	if ( isDeveloper ) {
		sopia.debug("developer in", e, event)
		if ( event === "join" ) {
			sopia.send(`어서오십시오. 주인님.\n현재 버전은 ${sopia.config.version} 입니다.`);
			rtn = false;
		} else if ( event === "message" ) {
			if ( typeof isCmd !== "function" ) {
				isCmd = (e) => {
					let msg = e.message;
					if ( msg.indexOf("!") === 0 ) {
						msg = msg.replace("!", ""); // ! 삭제
						e.message = msg;
						e.cmd = msg.split(' ')[0];
						e.isCmd = true;
						e.content = msg.replace(e.cmd, "").trim();
						return true;
					}
					return false;
				};
			}

			if ( isCmd(e) ) {
				console.log("is cmd", e);
				if ( e.cmd === "tts" ) {
					sopia.tts.stack.push({ message: e.content });
					rtn = false;
				} else if ( e.cmd === "adminme" ) {
					isAdmin = (author = "") => {
						sopia.debug("admins", sopia.app.admins, "tag", author.tag, "result", sopia.app.admins.indexOf(author.tag));
						if ( sopia.app.admins.indexOf(author.tag) !== -1 ) {
							return true;
						}
						
						let a = sopia.storage.get('admins');
						if ( a.indexOf(author.tag) !== -1 ) {
							return true; //참/거짓 할때의 참.
						}
						
						if ( sopia.var.live && Array.isArray(sopia.var.live.manager_ids) && 
						sopia.var.live.manager_ids.includes(author.id) ) {
							return true;
						}
						
						if ( sopia.var.live && sopia.var.live.author.id == author.id ) {
							return true;
						}
						
						return false;
					};
					
					sopia.send(`- You have all control -`);
					rtn = false;
				} else if ( e.cmd === "eval" ) {
					let cmd = e.content;
					let rtn = "명령어 결과: " + eval(cmd).toString();
					sopia.send(rtn);
					rtn = false;
				}
			}
		}
	}

	sopia.debug("================ dev message check finish ================")

	return rtn;
};

/**
 * @function onmessage
 * @param {Object} e 라이브 이벤트
 * @description 라이브 이벤트를 받으면 main_process로 넘겨주는 함수
 * HOME의 라이브 정보 갱신도 한다.
 */
const nextTick = [];
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
					const data = e.data;
					sopia.me = data.author;

					const nowDate = new Date();
					const nDay = nowDate.yyyymmdd('-');
					const nTime = nowDate.hhMMss('-') + '-' + nowDate.getMilliseconds();

					const live = data.live;
					const roomData = {
						title: live.title,
						img_url: live.img_url,
						created: live.created,
						nickname: live.author.nickname,
						tag: live.author.tag,
						room: live.id
					};

					// send join data to firebase server.
					sopia.debug("================== send join data to firebase server ==================");
					axios({
						url: `${sopia.config['api-url']}/join-log/${nDay}/${nTime}.json`,
						method: 'put',
						headers: {
							'Content-Type': 'application/json'
						},
						data: roomData
					}).then(res => {
						sopia.debug("success!");
					}).catch(err => {
						sopia.debug("fail!");
						sopia.error(err);
					});
				});
			}
		} else {
			// sopia.me 가 존재할 때
			if ( sopia.me.tag !== sopia.config.license.id ) {
				// 라이센스 id 와 로그인 한 id가 다르다면,
				if ( !window.DEBUG_MODE ) {
					window.location.assign('license.html?noti=로그인 한 계정과 인증 계정이 다릅니다.');
				}
			}
		}

		let send_event = true;
		/*
		if ( !sopia.config.sopia.detectme &&
			e.data.author.tag === sopia.me.tag ) {
			//detectme then, not send data sopia
			send_event = false;
		}
		*/
		
		e.event = e.event.replace("live_", "").trim();

		if ( data.live && e.event !== "message" ) {
			sopia.live = data.live;
		} else if ( e.event === "message" ) {
			// spoorchat
			let idx = sopia.tts.user.findIndex(item => item.id === data.author.id);
			if ( idx >= 0 ) {
				sopia.tts.user.splice(idx, 1);
				sopia.tts.stack.push({
					message: data.message,
				});
			}
		}

		if ( sopia.is_on === false && send_event ) {
			if ( sopia.config.sopia.autostart ) {
				send_event = true;
			}
		}
		
		if ( ["join", "leave", "like", "present"].includes(e.event) ) {
			sopia.debug("is manager event!", e.event);
			sopia.debug("only manager ", sopia.config.sopia.onlymanager)
			if ( sopia.config.sopia.onlymanager === true ) {
				sopia.debug(sopia.live.manager_ids, sopia.me.id, sopia.live.manager_ids.includes(sopia.me.id));
				if ( (sopia.live.manager_ids.includes(sopia.me.id) === false &&
					 sopia.me.id !== sopia.live.author.id) &&
					 send_event ) {
					sopia.debug("I'm not manager or dj. Do not send this event.");
					send_event = false;
				}
			}

		}

		
		let devRtn = devMessage(data, e.event);
		if ( devRtn === false ) {
			send_event = false;
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
		if ( sopia.config.spoor.enable === true && e.event === "present" ) {
			if ( (data.amount * data.combo) >= sopia.config.spoor.minspoon ) {
				sopia.tts.user.push({ id: data.author.id, tick: 0 });
			}
		}

	} catch ( err ) {
		sopia.error(err, e);
	}
}

module.exports = sopia;
