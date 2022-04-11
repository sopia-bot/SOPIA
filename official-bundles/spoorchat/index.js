'use strict';

/*
 * utils.js
 * Created on Fri Feb 11 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

const charWrapper =
	(str) => str.toString()
		.replace(/\\/g, '')
		.replace(/\./g, '')
		.replace(/\+/g, '+')
		.replace(/\n/g, ' ')
		.replace(/\ /, '');

/*
 * voice.js
 * Created on Fri Feb 11 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

const fs = window.require('fs');
const path$1 = window.require('path');

class Media {
	p = '';
	status = 0; // 0: init, 1: read, 2: ready, 3: playing, 4: done
	audio = null;
	prefix = 'data:audio/mp3;base64,';
	volume = 50; /* percentage */

	constructor(volume = 50) {
		this.volume = volume ?? 50;
		this.readFile = this.readFile.bind(this);
		this.bufferSet = this.bufferSet.bind(this);
		this._wait = this._wait.bind(this);
		this.play = this.play.bind(this);
	}

	readFile(p) {
		this.p = p;
		this.status = 1;
		fs.readFile(this.p, 'base64', (err, data) => {
			if ( err ) {
				logger.err('spoorchat', err);
				throw Error(err);
			}

			this.bufferSet(data);
		});
		return this;
	}

	bufferSet(b64str) {
		this.audio = new Audio(this.prefix + b64str);
		this.audio.volume = parseFloat(this.volume / 100);
		this.status = 2;
		return this;
	}

	_sleep(ms) {
		return new Promise((r) => setTimeout(r, ms));
	}

	async _wait() {
		if ( this.status === 0 ) {
			throw Error('Media buffer data is not set. code: ' + this.ready);
		}

		while ( this.status === 1 ) {
			await this._sleep(10);
		}
	}

	play() {
		return new Promise(async (resolve) => {
			await this._wait();
			this.status = 3;
			this.audio.onpause = () => {
				this.status = 4;
				this.audio = null;
				resolve();
			};
			this.audio.play();
		});
	}

}

/*
 * Voice Engine 함수는 읽을 text와 option 객체를 받는다,
 * base64 형태의 오디오 형식으로 반환하는 async 함수이다.
 */

class VoiceWorker {

	_effect = path$1.join(__dirname, 'sounds', 'default.mp3');
	_effectVolume = 50;
	_signature = {};
	_text = '';
	_voiceEngine = async () => {};
	_voiceOption = {};
	_voiceVolume = 50;
	_readyVoiceList = [];
	_voiceCount = 0;
	_resolve = () => {};

	constructor() {
		this._playReadyVoice = this._playReadyVoice.bind(this);
		this.effect = this.effect.bind(this);
		this.text = this.text.bind(this);
		this.signature = this.signature.bind(this);
		this.engine = this.engine.bind(this);
		this._signatureParser = this._signatureParser.bind(this);
	}

	play() {
		return new Promise(async (resolve, reject) => {
			this._resolve = resolve.bind(this);
			const effectPlaying = new Media(this._effectVolume)
				.readFile(this._effect)
				.play();

			const args = this._signatureParser();
			this._voiceCount = args.length;
			effectPlaying.then(this._playReadyVoice.bind(this));
			for ( const arg of args ) {
				if ( this._signature[arg] ) {
					this._readyVoiceList.push(
						new Media(this._voiceVolume)
							.readFile(this._siganture[arg])
					);
				} else {
					const b64str = await this._voiceEngine(arg, this._voiceOption);
					if ( b64str ) {
						this._readyVoiceList.push(
							new Media(this._voiceVolume)
								.bufferSet(b64str)
						);
					} else {
						this._voiceCount--;
					}
				}
			}
		});
	}

	_sleep(ms) {
		return new Promise((r) => setTimeout(r, ms));
	}

	async _playReadyVoice() {
		while ( this._voiceCount > 0 ) {
			if ( this._readyVoiceList.length > 0 ) {
				const media = this._readyVoiceList.shift();
				await media.play();
				this._voiceCount--;
			} else {
				await this._sleep(10);
			}
		}
		this._resolve();
	}

	effect(p) {
		this._effect = p;
		return this;
	}

	effectVolume(volume = 50) {
		this._effectVolume = volume;
		return this;
	}

	voiceVolume(volume = 50) {
		this._voiceVolume = volume;
		return this;
	}

	text(str) {
		this._text = str;
		return this;
	}

	signature(sigs = []) {
		this._signature = sigs;
		return this;
	}

	engine(func, option) {
		this._voiceEngine = func;
		this._voiceOption = option;
		return this;
	}

	_signatureParser() {
		const sigs = Object.keys(this._signature);
		if ( sigs.length <= 0 ) {
			// 시그니처가 없으면 파싱하지 않아도 됨
			return [ this._text ];
		}

		charWrapper(this._text);

		let regxStr = '(';
		sigs.forEach((s, idx) => {
			if ( idx > 0 ) {
				regxStr += '|';
			}
			regxStr += `${s.replace(/(\(|\))/g, '\\$1')}`;
		});
		regxStr += ')';
		const regx = new RegExp(regxStr);
		return this._text.split(regx);
	}

	static New() {
		return new VoiceWorker();
	}
}

/*
 * spoorchat.js
 * Created on Thu Feb 10 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
const CfgLite = window.appCfg.__proto__.constructor;
const path = window.require('path');

const rand = (num=0, min=0) => Math.floor(Math.random() * (num)) + min;
const cfg = new CfgLite(path.join(__dirname, 'config.cfg'));

class SpoorChat {

	_running = false;
	_presentedStack = [];
	_chatStack = [];
	_voiceList = [];

	options = {
		min: 1, /* spoon */
		timeout: 30, /* sec */
		effectVolume: 50, /* percentage */
		voiceVolume: 50, /* percentage */
		voice: 'random',
		signature: {},
	};

	constructor() {
		this.options = cfg.get('options');

		this.processor = this.processor.bind(this);
		this.presentEvent = this.presentEvent.bind(this);
		this.chatEvent = this.chatEvent.bind(this);
	}

	setOption(options) {
		for ( const [key, val] of Object.entries(options) ) {
			this.options[key] = val;
		}
	}

	addVoice(obj) {
		this._voiceList.push(obj);
		cfg.set('voice-list', this._voiceList.map((voice) => ({
			text: voice.label,
			value: voice.name,
		})));
		cfg.save();
	}

	async processor() {
		// timeout check 
		this._presentedStack.forEach((item, idx) => {
			if ( item.tick++ > this.options.timeout ) {
				this._presentedStack.splice(idx, 1); // delete
			}
		});

		// do not have item
		if ( this._chatStack.length <= 0 ) {
			return;
		}

		if ( this._running ) {
			return;
		}

		const item = this._chatStack.shift();
		this._running = true;

		let voice = null;
		if ( this.options.voice === 'random' ) {
			voice = this._voiceList[rand(this._voiceList.length)];
		} else {
			voice = this._voiceList.find((v) => v.name === this.options.voice);
		}

		if ( !voice ) {
			this._running = false;
			throw Error('Voice is null');
		}
		const worker = new VoiceWorker()
			.text(item.message)
			.signature(this.options.signature)
			.engine(voice.engine, voice.option)
			.effectVolume(this.options.effectVolume)
			.voiceVolume(this.options.voiceVolume);

		await worker.play();

		this._running = false;
	}

	chatEvent(evt, sock) {
		const idx = this._presentedStack.findIndex((item) => item.id === evt.data.user.id);

		if ( idx >= 0 ){
			const [presented] = this._presentedStack.splice(idx, 1);
			const stack = {
				message: evt.update_component.message.value,
				combo: presented.combo || 1,
				sticker: presented.sticker || 'sticker_kr_juice',
			};
			this._chatStack.push(stack);
			logger.info('spoorchat', 'Add prcoess stack', stack);
		}

		if ( evt.data.user.tag === 'a.i_sopia' ) {
			const stack = {
				message: evt.update_component.message.value,
				combo: 1,
				sticker: 'sticker_kr_juice',
			};
			this._chatStack.push(stack);
			logger.info('spoorchat', 'Add prcoess stack', stack);
			this.processor();
		}
	}

	presentEvent({ data }, sock) {
		const spoon = (data.amount * data.combo);

		if ( spoon >= this.options.min ) {
			const item = {
				id: data.author.id,
				tick: 0,
				sticker: data.sticker,
				combo: data.combo,
			};
			this._presentedStack.push(item);
			logger.info('spoorchat', 'Add presented user information', item);
		}
	}

}

var spoorChat = new SpoorChat();

/*
 * google.js
 * Created on Fri Feb 11 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

const axios$1 = window.axios;
const API_KEY$1 = atob('QUl6YVN5Q0NUTmFaQ2JKenJpVnVmV1dSNDlldU85QU9ZODVaajFj');

async function GoogleVoice(text, option) {
	if ( !text ) {
		return '';
	}
	const res = await axios$1({
		url: `https://texttospeech.googleapis.com/v1/text:synthesize`,
		params: {
			key: API_KEY$1,
			alt: 'json',
		},
		method: 'post',
		data: {
			"input": {
				text,
			},
			"voice": option,
			"audioConfig": {
				"audioEncoding": 'MP3',
			},
		},
	});

	return res.data.audioContent.toString('base64');
}

const axios = window.axios;
const API_KEY = atob('S2FrYW9BSyA3YjJmNzY2ZTIwZDI4NWY3YmQ3MzA2OWVjNTIwYjI5Mg');

/*
option: {
	voice: string
}
*/
async function KakaoVoice(text, option) {
	if ( !text ) {
		return '';
	}

	const res = await axios({
		url: 'https://kakaoi-newtone-openapi.kakao.com/v1/synthesize',
		method: 'post',
		data: `<speak><voice name="${option.voice}">${text}</voice></speak>`,
		headers: {
			'Content-Type': 'application/xml',
			'Authorization': API_KEY,
		},
		responseType: 'arraybuffer',
	});

	console.log('kakao', res);

	return Buffer.from(res.data, 'binary').toString('base64');
}

/*
 * index.js
 * Created on Fri Jan 28 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

/* S: GOOGLE */
spoorChat.addVoice({
	name: 'minji',
	label: '민지',
	option: {
		languageCode: 'ko-KR',
		name: 'ko-KR-Wavenet-A',
		ssmlGender: 'FEMALE',
	},
	engine: GoogleVoice,
});
spoorChat.addVoice({
	name: 'minjung',
	label: '민정',
	option: {
		languageCode: 'ko-KR',
		name: 'ko-KR-Wavenet-B',
		ssmlGender: 'FEMALE',
	},
	engine: GoogleVoice,
});
spoorChat.addVoice({
	name: 'minsu',
	label: '민수',
	option: {
		languageCode: 'ko-KR',
		name: 'ko-KR-Wavenet-C',
		ssmlGender: 'MALE',
	},
	engine: GoogleVoice,
});
spoorChat.addVoice({
	name: 'minsang',
	label: '민상',
	option: {
		languageCode: 'ko-KR',
		name: 'ko-KR-Wavenet-D',
		ssmlGender: 'MALE',
	},
	engine: GoogleVoice,
});
/* E: GOOGLE */

/* S: KAKAO */
spoorChat.addVoice({
	name: 'spring',
	label: '봄',
	option: {
		voice: 'WOMAN_READ_CALM',
	},
	engine: KakaoVoice,
});
spoorChat.addVoice({
	name: 'ryan',
	label: '라이언',
	option: {
		voice: 'MAN_READ_CALM',
	},
	engine: KakaoVoice,
});
spoorChat.addVoice({
	name: 'naomi',
	label: '나오미',
	option: {
		voice: 'WOMAN_DIALOG_BRIGHT',
	},
	engine: KakaoVoice,
});
spoorChat.addVoice({
	name: 'nick',
	label: '닉',
	option: {
		voice: 'MAN_DIALOG_BRIGHT',
	},
	engine: KakaoVoice,
});
/* E: KAKAO */

const sopia = window.bctx.get('spoorchat');
sopia.itv.add('spootchat', spoorChat.processor, 1000);


exports.live_present = spoorChat.presentEvent;
exports.live_message = spoorChat.chatEvent;
