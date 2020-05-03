const projectId='silken-avatar-268104';
const keyfile='./sopia-tts.json';
const { ipcMain, ipcRenderer } = require('electron');
const httpReq = require('request');
const fs = require('fs');


let client = null;

Buffer.prototype.toB64Str = function() {
	let buf = this;
	return "data:audio/mp3;base64," + buf.toString('base64');
};

String.prototype.toB64Str = function() {
	let buf = this;
	return "data:audio/mp3;base64," + Buffer.from(buf).toString('base64');
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
	"jinho": {
		url: 'https://naveropenapi.apigw.ntruss.com/voice/v1/tts',
		speed: '0',
		type: 'clova',
		label: "진호",
	},
	"mijin": {
		url: 'https://naveropenapi.apigw.ntruss.com/voice/v1/tts',
		speed: '0',
		type: 'clova',
		label: "미진",
	},
	"nara": {
		url: 'https://naveropenapi.apigw.ntruss.com/voice-premium/v1/tts',
		speed: '0',
		type: 'clova',
		label: "나라",
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


const StrToSpeech = (str, type = "minji") => {
	return new Promise((resolve, reject) => {
		if ( !str ) reject(new Error('str is undefined'));

		if ( type === "random" ) {
			let voiceList = Object.keys(voices);
			let idx = Math.floor(Math.random() * (voiceList.length));

			type = voiceList[idx];
		}

		switch ( voices[type].type ) {
			case 'google': 
				const request = {
					input: { text: str },
					voice: {
						languageCode: voices[type].languageCode,
						name: voices[type].name,
						ssmlGender: 'MALE',
					},
					audioConfig: {audioEncoding: 'MP3'},
				};
		
				client.synthesizeSpeech(request, (err, response) => {	
					if (err) {		
						reject(err);
					}
					resolve(response.audioContent.toB64Str());
				});
				break;
			case 'kakao': 
			{
				const voice = voices[type];
				const text = `<speak><voice name="${voice.name}">${str}</voice></speak>`;
				const options = {
					url: voice.url,
					method: 'post',
					body: text,
					headers: {
						'Content-Type': 'application/xml',
						'Authorization': 'KakaoAK 227c3ea3e1e0faa103d23c63b3854337',
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
			}
			case 'clova':
			{
				const voice = voices[type];
				const options = {
					url: voice.url,
					method: 'post',
					form: {
						speaker: type,
						speed: voice.speed,
						text: str,
					},
					headers: {
						'X-NCP-APIGW-API-KEY-ID': 'j9ifzemgve',
						'X-NCP-APIGW-API-KEY': 'vnWi79wTotcbod8R1aB8kQbLAz7nDFC0fYxlBIWR',
					},
				};

				const fname = "clova-tts-" + new Date().getTime() + new Date().getMilliseconds() + '.mp3';
				const writable = fs.createWriteStream(fname);

				try {
					const req = httpReq(options, (err, res, body) => {
						if ( err ) {
							reject(err);
						}
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
			}
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
		const textToSpeech = require('@google-cloud/text-to-speech');
		client = new textToSpeech.TextToSpeechClient({
			projectId:projectId,
			keyFilename: keyfile,
		});

		ipcMain.on('text-to-speech-req', (event, options) => {
			StrToSpeech(options.text, options.type).
				then(b64Audio => {
					event.reply(options.resKey, { result: 'success', data: b64Audio });
				}).
				catch(err => {
					event.reply(options.resKey, { result: 'fail', data: err });
				});
		});
	}
};

module.exports = {
	init: mainInit,
	read: tts,
	voices,
};
