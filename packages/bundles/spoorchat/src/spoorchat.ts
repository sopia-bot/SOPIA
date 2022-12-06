/*
 * spoorchat.js
 * Created on Thu Feb 10 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { checkPresent, getEffectPath } from './utils.js';
import VoiceWorker from './voice.js';
import CfgLite from 'cfg-lite';
const path = window.require('path');

const rand = (num=0, min=0) => Math.floor(Math.random() * (num)) + min;
const cfg = new CfgLite(path.join(__dirname, 'config.cfg'));

class SpoorChat {

	_running = false;
	_presentedStack: any[] = [];
	_chatStack: any[] = [];
	_voiceList: any[] = [];

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
				const deletedItem = this._presentedStack.splice(idx, 1); // delete
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

		let voice: any = null;
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
			.effect(getEffectPath(item))
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
		}

		if ( evt.data.user.tag === 'a.i_sopia' ) {
			const stack = {
				message: evt.update_component.message.value,
				combo: 1,
				sticker: 'sticker_kr_juice',
			};
			this._chatStack.push(stack);
			this.processor();
		}
	}

	presentEvent({ data }, sock) {
		if ( checkPresent(cfg, data) ) {
			const item = {
				id: data.author.id,
				tick: 0,
				sticker: data.sticker,
				combo: data.combo,
			};
			this._presentedStack.push(item);
		}
	}

}

export default new SpoorChat();
