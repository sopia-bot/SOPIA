////////////////////////////////////////////////////////////////
//  파일 : sopia.js                                           //
//  작성자 : mobbing                                          //
//  주석 : sopia 객체를 생성하는 스크립트                       //
///////////////////////////////////////////////////////////////

const { LiveEvent } = require('sopia-core');

/**
 * @sopia 의 객체를 생성한다.
 * 기본적으로 EventEmitter을 사용하여 스푼에서 받은 이벤트를 처리한다.
 * sopia.storage 에선 sopia.storage.save 함수를 사용하지 않는 한, sopia 재시작시 수정된 변수값을 초기화한다.
 * sopia.var은 프로그램 재시작 전까진 값을 가지고 있는다.
 */
const sopia = new EventEmitter();
sopia.setMaxListeners(200);

sopia.modules = {
	axios: require('axios'),
	path: require('path'),
	fs: require('fs'),
};

sopia.api = {
	rand: (num=0, min=0) => Math.floor(Math.random() * (num)) + min,
	getMembers: (liveid = sopia.live.id) => {
		return new Promise((resolve, reject) => {
			let members = [];
			const reqMembers = (url) => {
				sopia.modules.axios({
					url,
				}).then(res => {
					const data = res.data;
					members = members.concat(data.results);
					if ( data.next ) {
						reqMembers(data.next);
					} else {
						resolve(members);
					}
				});
			};
			reqMembers(`https://kr-api.spooncast.net/lives/${liveid}/members/`);
		});
	},
	blockUser: (id, tidx=0) => {
		if ( Number.isInteger(id) ) {
			if ( sopia.props && sopia.props.authKey ) {
				if ( sopia.live && sopia.live.id ) {
					sopia.modules.axios({
						headers: {
							"authorization": sopia.props.authKey
						},
						method: 'post',
						url: `https://kr-api.spooncast.net/lives/${sopia.live.id}/block/`,
						data: {
							block_user_id: id
						}
					});
				}
			}
		}
	},
};

sopia.tts = speech;

sopia.var = {};
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
					let { d, k } = getObject(obj.default, key, 1);
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
						noti.error("["+file+"] 파일이 없습니다.");
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

sopia.wlog = writeLog;

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
 */
sopia.send = (msg) => {
	if ( typeof msg === 'string' ) {
		if ( msg.length > 0 ) {
            msg = msg.replace(/"/g, '\\"');
			const limit = 100;
			const smsg = msg.split('\n');
			if ( smsg.length === 1 ) {
				// don't have new line
				for ( let i=0;i<msg.length;i+=limit ) {
					sopia.msgQ.push(msg.substr(i, limit));
				}
			} else {
				let m = '';
				while ( smsg.length > 0 ) {
					if ( smsg[0].length > limit ) {
						if ( m.length > 0 ) {
							sopia.msgQ.push(m);
						}
						for ( let i=0;i<smsg[0].length;i+=limit ) {
							sopia.msgQ.push(smsg[0].substr(i, limit));
						}
						smsg.shift();
						m = '';
					} else {
						if ( m.length + smsg[0].length >= 100 ) {
							sopia.msgQ.push(m);
							m = '';
						}
						m += smsg.shift() + '\\n';
					}
                }
                sopia.msgQ.push(m);
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
            const msg = sopia.msgQ.shift().replace(/(\s|\\n)+$/, '');
			if ( typeof msg === "string" && msg.length > 0 ) {
                sopia.sock.message(msg);
				setTimeout(() => {
					// node 소켓이 더 빠르기 때문에 딜레이를 맞춰주기 위함
					webview.executeJavaScript('addChatBox(`'+msg.replace(/`/g, '\\`').replace(/\$/g, '\\$')+'`);');
				}, 100);
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


if ( window.DEBUG_MODE ) {
	sopia.debug = console.log;
	sopia.error = console.error;
}

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

const getEffectSound = (sticker, combo) => {
	if ( !sticker ) {
		console.log('sticker is none');
		return getPath('/media/SpoorChatNoti.mp3');
	}

	sticker = sticker.replace(/_(kr)_/i, '_');

	let file;

	if ( combo >= 10 ) {
		if ( fs.existsSync(getPath('/media/' + sticker + '_long.mp3')) ) {
			file = getPath('/media/' + sticker + '_long.mp3');
		}
	}

	if ( !file ) {
		file = getPath('/media/' + sticker + '.mp3');
	}
	
	if ( !fs.existsSync(file) ) {
		console.log('file not found');
		return getPath('/media/SpoorChatNoti.mp3');
	}

	console.log('file?', file);

	return file;
}

const spoorEffectPlay = async (sticker, combo) => {
    fs.readFile(getEffectSound(sticker, combo), { encoding: 'base64' }, async (err, data) => {
        const notiSnd = new Audio("data:audio/mp3;base64," + data);
        notiSnd.volume = (sopia.config.spoor.effectvolume * 0.01);
        notiSnd.onpause = function() {
            if ( err ) {
				console.error(err);
				sopia.tts.isrun = false;
				return;
            }
            sopia.tts.efinish = true;
        };

        let delay = 0;
        while ( sopia.tts.readStack[0] === undefined && delay++ < 200 ) {
            await asleep(10);
        }
        notiSnd.play();
    });
};

const spoorMakeVoice = async (argv, voiceType, useTypecast, tcidx) => {
	console.log('spoor make voice', argv, voiceType, useTypecast, tcidx);
    if ( Array.isArray(argv) ) {
        argv.forEach((arg, idx) => {
            let sigFile = sopia.config.spoor.signature[arg];
            if ( sigFile ) {
                // has signature
                fs.readFile(sigFile, (err, data) => {
					if ( !data ) {
						sopia.tts.readStack[idx] = 'no run';
					} else {
                    	if ( path.extname(sigFile) === '.base64' ) {
							sopia.tts.readStack[idx] = data.toString('utf8');
						} else {
							sopia.tts.readStack[idx] = data.toB64Str();
						}
					}
                });
            } else {
                if ( arg.trim() !== "" ) {
                    if ( useTypecast || sopia.config.spoor.type === 'typecast' ) {
                        TC.read(TCVoices[tcidx], arg.trim()).then(buf => {
                            sopia.tts.readStack[idx] = buf;
                        });
                    } else {
						console.log(`normal tts [${arg.trim()}], [${voiceType}]`);
                        sopia.tts.read(arg.trim(), voiceType).then(buf => {
                            if ( !sopia.tts.readStack.includes(buf) ) {
                                sopia.tts.readStack[idx] = buf;
                            } else {
                                // 이전과 동일한 tts로 나올 시 1회만 더 실행
                                sopia.debug("I find matched file. 1 time retry. idx", idx);
                                sopia.tts.read(arg.trim(), voiceType).then(buf => {
                                    sopia.debug("success get buf. idx", idx);
                                    sopia.tts.readStack[idx] = buf;
                                });
                            }
                        }).catch((err) => {
                            sopia.tts.isrun = false;
                            console.error(err);
                            return;
                        });
                    }
                } else {
                    sopia.tts.readStack[idx] = "no run";
                }
            }
        });
    } else {
        return false;
    }
    return true;
}


const spoorSpeech = (buf, volume) => {
    return new Promise((resolve, reject) => {
        const audio = new Audio(buf);
        audio.onpause = () => {
            audio.remove();
            resolve();
        };
        audio.volume = volume;
        audio.play();
        
        sopia.tts.stop = () => {
            audio.onpause = () => {};
            audio.pause();
            audio.remove();
            reject();
        };
    });
}

sopia.itv.add('dev-spoorchat', async () => {
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

		const chatData = sopia.tts.stack.shift();
		sopia.debug("============= Spoor Chat =============");
        sopia.wlog('INFO', `Run spoor chat (${chatData.message})`);
        
        
        sopia.tts.efinish = false;
        spoorEffectPlay(chatData.sticker, chatData.combo);

        let voiceType = sopia.config.spoor.type;
        const sigKeys = Object.keys(sopia.config.spoor.signature);

        let useTypecast = false;
        let tcidx = sopia.config.spoor.tcidx;
        let selVoice = false;

        // select voice type
        if ( voiceType === "random" ) {
            const useRandSelIdx = [];
            if ( Array.isArray(sopia.config.spoor.randsel) ) {
                sopia.config.spoor.randsel.forEach((rand, idx) => {
                    if ( rand.use ) {
                        useRandSelIdx.push(idx);
                    }
                });
            }

            if ( useRandSelIdx.length === 0 ) {
                useRandSelIdx = sopia.config.spoor.randsel;
            }

            const ridx = sopia.api.rand(useRandSelIdx.length);
            const sel = sopia.config.spoor.randsel[useRandSelIdx[ridx]];

            useTypecast = (sel.type === 'typecast');
            voiceType = tcidx = sel.val;
        }

		
		let parse = chatData.message.match(/(.*?)\/(.*)/);
		let argv;
		if ( !parse || parse.length < 3 ) {
			argv = sopia.tts.parser(chatData.message, sigKeys);
		} else {
			const sel = sopia.config.spoor.randsel.find(r => r.label === parse[1]);
			if ( sel ) {
				const msg = parse[2];
				useTypecast = (sel.type === 'typecast');
				voiceType = tcidx = sel.val;
				argv = sopia.tts.parser(msg, sigKeys);
			} else {
				argv = sopia.tts.parser(chatData.message, sigKeys);
			}
		}

		sopia.debug('argv after parse', argv);
        
        sopia.tts.readStack = null;
        sopia.tts.readStack = new Array(argv.length);

        
        try {
			
            if ( spoorMakeVoice(argv, voiceType, useTypecast, tcidx) ) {
                let speechIdx = 0;
                let pool = 0;
                while ( speechIdx < sopia.tts.readStack.length ) {

                    await asleep(100);

                    if ( !sopia.tts.efinish ) {
                        continue;
                    }

                    if ( sopia.tts.readStack[speechIdx] === undefined ) {
                        continue;
                    }

                    if ( sopia.tts.readStack[speechIdx] === 'no run' ) {
                        speechIdx++;
                        continue;
                    }

                    try {
                        let b64snd = sopia.tts.readStack[speechIdx];
                        await spoorSpeech(b64snd, sopia.config.spoor.ttsvolume * 0.01);
                        speechIdx++;
                    } catch(err) {
                        if ( err ) {
                            console.error(err);
                        }
                        break;
                    }

                }
            } else {
                console.error('Make voice fail.');
            }
        } catch(err) {
            sopia.debug('speech error');
            sopia.wlog('ERROR', 'spoor chat error');
			console.error(err);
        }
        
        sopia.tts.readStack.splice(0, sopia.tts.readStack.length);
        sopia.tts.stop = null;
        sopia.tts.isrun = false;
        document.querySelectorAll('a[name="play-pause"]').forEach((element) => {
            element.style = "display: none";
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
		sopia.debug("developer in", e, event);
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
				if ( e.cmd === "tts" ) {
                    sopia.tts.stack.push({ message: e.content.trim() });
                    sopia.send(`스택 추가 완료 [${e.content.trim()}]`);
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

	sopia.debug("================ dev message check finish ================");

	return rtn;
};

/**
 * @function onmessage
 * @param {Object} e 라이브 이벤트
 * @description 라이브 이벤트를 받으면 main_process로 넘겨주는 함수
 * HOME의 라이브 정보 갱신도 한다.
 */
const nextTick = [];
sopia.onmessage = async (e) => {
	try {
        let data = e.data;
        sopia.debug('[onmessage]', e);
        
        if ( e.event === LiveEvent.LIVE_RANK || e.userAgent === 'Server' ) {
            return;
        }

		if ( nextTick.length > 0 ) {
			let func = nextTick.shift();
			if ( typeof func === "function" ) {
				func(e);
			}
        }
        
		if ( (e.event !== LiveEvent.LIVE_MESSAGE && e.event !== LiveEvent.LIVE_LAZY_UPDATE) && data.author.tag === sopia.me.tag ) {
			return;
		}

		let send_event = true;

		e.event = e.event.replace("live_", "").trim();

		if ( data.live && e.event !== "message" ) {
			sopia.live = data.live;
		} else if ( e.event === "message" ) {
			// legasy code support
			data.message = e.update_component.message.value;
			// spoorchat
			let idx = sopia.tts.user.findIndex(item => item.id === data.author.id);
			if ( idx >= 0 ) {
				const d = sopia.tts.user[idx];
				const push = {
					message: data.message,
					combo: d.combo,
					sticker: d.sticker,
				};
				sopia.debug('tts push data', push);
				sopia.tts.stack.push(push);
				sopia.tts.user.splice(idx, 1);
			}
		}

        
		let devRtn = devMessage(data, e.event);
		if ( devRtn === false ) {
			send_event = false;
		}

		if ( sopia.isLoading === false ) {
			sopia.isLoading = true;
            loadScript(() => {
				sopia.onmessage(e);
				sopia.on('message', (e) => {
					if ( e.isCmd || isCmd(e) ) {
						if ( e.cmd === '목형' ) {
							const list = sopia.config.spoor.randsel.map(r => r.label);
							sopia.send(`사용 가능한 목소리: ${list.join(', ')}`);
						}
					}
				});
			});
            return;
		}

		sopia.debug("send event", send_event);
		if ( send_event === true ) {
			sopia.debug('event', e.event);
			sopia.emit(e.event, data);
		}
		sopia.emit('all', e);

		//라이브 정보
		if ( data && data.live && e.event !== "message" ) {
			let live = data.live;
			document.querySelector('#liveTitle').innerText = live.title;
			document.querySelector('#liveStartTime').innerText = new Date(live.created).toLocaleString();
			document.querySelector('#liveBgUrl').innerText = live.imgUrl;
			document.querySelector('#liveMemberCount').innerText = live.memberCount;
			document.querySelector('#liveLikeCount').innerText = live.likeCount;
			document.querySelector('#liveTotalMebmerCount').innerText = live.totalMemberCount;

			//비제이 정보
			if ( live.author ) {
				let author = live.author;
				document.querySelector('#bjName').innerText = author.nickname;
				document.querySelector('#bjTag').innerText = author.tag;
				document.querySelector('#bjPID').innerText = author.id;
				document.querySelector('#bjProfileUrl').innerText = author.profileUrl;
				document.querySelector('#bjDateJoined').innerText = new Date(author.dateJoined).toLocaleString();
			}
		}

		// spoor chat
		if ( sopia.config.spoor.enable === true && e.event === "present" ) {
			if ( (data.amount * data.combo) >= sopia.config.spoor.minspoon ) {
				sopia.tts.user.push({ id: data.author.id, tick: 0, sticker: data.sticker, combo: data.combo });
			}
		}

	} catch ( err ) {
        sopia.error(err, e);
        console.error(err, e);
	}
};

module.exports = sopia;
