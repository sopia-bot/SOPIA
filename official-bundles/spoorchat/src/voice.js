/*
 * voice.js
 * Created on Fri Feb 11 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

const fs = window.require('fs');
const path = window.require('path');
import { charWrapper } from './utils.js';

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

	_effect = path.join(__dirname, 'sounds', 'default.mp3');
	_signature = {};
	_text = '';
	_voiceEngine = async () => {};
	_voiceOption = {};
	_readyVoiceList = [];
	_voiceCount = 0;

	constructor() {
		this._playReadyVoice = this._playReadyVoice.bind(this);
		this.effect = this.effect.bind(this);
		this.text = this.text.bind(this);
		this.signature = this.signature.bind(this);
		this.engine = this.engine.bind(this);
		this._signatureParser = this._signatureParser.bind(this);
	}

	async play() {
		const effectPlaying = new Media()
			.readFile(this._effect)
			.play();

		const args = this._signatureParser();
		this._voiceCount = args.length;
		effectPlaying.then(this._playReadyVoice.bind(this));
		for ( const arg of args ) {
			if ( this._signature[arg] ) {
				this._readyVoiceList.push(
					new Media()
						.readFile(this._siganture[arg])
				);
			} else {
				const b64str = await this._voiceEngine(arg, this._voiceOption);
				this._readyVoiceList.push(
					new Media()
						.bufferSet(b64str)
				);
			}
		}

	}

	_sleep(ms) {
		return new Promise((r) => setTimeout(r, ms));
	}

	async _playReadyVoice() {
		while ( this._voiceCount > 0 ) {
			if ( this._readyVoiceList.length > 0 ) {
				const media = this._readyVoiceList.shift();
				await media.play();
			} else {
				await this._sleep(10);
			}
		}
	}

	effect(p) {
		this._effect = p;
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

		const text = charWrapper(this._text);

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

export default VoiceWorker;
