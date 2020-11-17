const { ipcMain, ipcRenderer, remote } = require('electron');
const { app } = remote;
let httpReq = require('request');
let axios = require('axios');
const fs = require('fs');
const path = require('path');

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

Buffer.prototype.toB64Str = function() {
	let buf = this;
	return "data:audio/mp3;base64," + buf.toString('base64');
};

String.prototype.toB64Str = function() {
	let buf = this;
	return "data:audio/mp3;base64," + buf.toString('base64');
};

const voices = {
	"minji": {
		url: 'https://naveropenapi.apigw.ntruss.com/voice/v1/tts',
		languageCode: 'ko-KR',
		name: 'ko-KR-Wavenet-A',
		ssmlGender: 'FEMALE',
		type: 'google',
		label: "민지",
	},
	"minjung": {
		url: 'https://naveropenapi.apigw.ntruss.com/voice/v1/tts',
		languageCode: 'ko-KR',
		name: 'ko-KR-Wavenet-B',
		ssmlGender: 'FEMALE',
		type: 'google',
		label: "민정",
	},
	"minsu": {
		url: 'https://naveropenapi.apigw.ntruss.com/voice/v1/tts',
		languageCode: 'ko-KR',
		name: 'ko-KR-Wavenet-C',
		ssmlGender: 'MALE',
		type: 'google',
		label: "민수",
	},
	"minsang": {
		url: 'https://naveropenapi.apigw.ntruss.com/voice/v1/tts',
		languageCode: 'ko-KR',
		name: 'ko-KR-Wavenet-D',
		ssmlGender: 'MALE',
		type: 'google',
		label: "민상",
	},
	"spring": {
		url: 'https://kakaoi-newtone-openapi.kakao.com/v1/synthesize',
		name: 'WOMAN_READ_CALM',
		type: 'kakao',
		label: "봄",
	},
	"ryan": {
		url: 'https://kakaoi-newtone-openapi.kakao.com/v1/synthesize',
		name: 'MAN_READ_CALM',
		type: 'kakao',
		label: "라이언",
	},
	"naomi": {
		url: 'https://kakaoi-newtone-openapi.kakao.com/v1/synthesize',
		name: 'WOMAN_DIALOG_BRIGHT',
		type: 'kakao',
		label: "나오미",
	},
	"nick": {
		url: 'https://kakaoi-newtone-openapi.kakao.com/v1/synthesize',
		name: 'MAN_DIALOG_BRIGHT',
		type: 'kakao',
		label: "닉",
	},
};

let gUserInfo = null;

let apiKey = "";
let getApiKeyMutex = false;
const getApiKey = () => {
    if ( getApiKeyMutex ) return;
    getApiKeyMutex = true;
    axios.get('https://sopia-bot.firebaseio.com/11-app/plugins/speech/api-key.json')
        .then(res => {
            apiKey = res.data;
        })
        .finally(() => {
            getApiKeyMutex = false;
        });
};
getApiKey();

const StrToSpeech = (str, type = "minji") => {
	return new Promise(async (resolve, reject) => {
		if ( !str ) reject(new Error('str is undefined'));

		if ( type === "random" ) {
			let voiceList = Object.keys(voices);
			let idx = Math.floor(Math.random() * (voiceList.length));

			type = voiceList[idx];
		}

		const voice = voices[type];

		if ( voice.premium ) {
			const config = orgRequire(getPath('config.json'));

			if ( !gUserInfo ) {
				try {
					const res = await axios({
						url: `${config['api-url']}/users/${config.license.key}.json`,
						method: 'get',
					});
					gUserInfo = res.data;
				} catch(err) {
					console.error(err);
					reject(err);
					return;
				}
			}

			if ( !gUserInfo['is-premium'] ) {
				reject(new Error('프리미엄 계정이 아닙니다.'));
				return;
			}


			httpReq({
				url: 'https://us-central1-sopia-bot.cloudfunctions.net/premium/tts',
				method: 'put',
				body: JSON.stringify({
					serial: config.license.key,
					type: voice.type,
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			}, (err, res, body) => {
			});
		}

		switch ( voice.type ) {
			case 'google': 
			{
				axios({
					url: `https://texttospeech.googleapis.com/v1/text:synthesize`,
					params: {
						key: apiKey,
						alt: 'json',
					},
					method: 'post',
					data: {
						"input": {
							"text": str,
						},
						"voice": {
							languageCode: voice.languageCode,
							name: voice.name,
							ssmlGender: 'MALE',
						},
						"audioConfig": {
							"audioEncoding": 'MP3',
						},
					},
				}).then(res => {
					if ( res ) {
						if ( res.data ) {
							if ( res.data.audioContent ) {
								resolve(res.data.audioContent.toB64Str());
							} else {
								reject(new Error('invalid audioContent'));
							}
						} else {
							reject(new Error('invalid res data'));
						}
					} else {
						reject(new Error('invalid axios response'));
					}
				}).catch(reject);
				break;
			} // google
			case 'kakao':
			{
				str = str.replace(/[<>&]/g, '');
				const text = `<speak><voice name="${voice.name}">${str}</voice></speak>`;
				const options = {
					url: voice.url,
					method: 'post',
					body: text,
					headers: {
						'Content-Type': 'application/xml',
						'Authorization': 'KakaoAK 7b2f766e20d285f7bd73069ec520b292',
					},
				};

				const fname = "kakao-tts-" + new Date().getTime() + new Date().getMilliseconds() + '.mp3';
				const writable = fs.createWriteStream(fname);

				try {
					const req = httpReq(options, (err, res, body) => {
						if ( err ) {
							reject(err);
						}
						//resolve(body.toB64Str())
					});
					req.pipe(writable);
				} catch(err) {
					console.error(err);
					reject(err);
				}
				writable.on('close', () => {
					const str = fs.readFileSync(fname);
					fs.unlinkSync(fname);
					resolve(str.toB64Str());
				});
				break;
			} // kakao
		}
	});
};

const tts = (text, type) => {
	return new Promise((resolve, reject) => {
		const resKey = `text-to-speech-res-${new Date().getTime()}`;
		ipcRenderer.once(resKey, (event, res) => {
			if ( res.result === 'success' ) {
				resolve(res.data);
			} else {
				reject(res.data);
			}
		});
		ipcRenderer.send('text-to-speech-req', { text, type, resKey });
	});
};

const mainInit = () => {
	let isBrowser = typeof window !== 'undefined';
	if ( !isBrowser ) {
		ipcMain.on('text-to-speech-req', (event, options) => {
			StrToSpeech(options.text, options.type).
				then(b64Audio => {
					event.reply(options.resKey, { result: 'success', data: b64Audio });
				}).
				catch(err => {
					event.reply(options.resKey, { result: 'fail', data: err.message });
				});
		});

		ipcMain.once('init-http', (event, funcs) => {
			httpReq = func.request;
			axios = func.axios;
		});
	}
};

module.exports = {
	init: mainInit,
	read: StrToSpeech,
	voices,
};
