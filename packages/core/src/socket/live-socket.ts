/*
 * live-socket.ts
 * Created on Fri Apr 30 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import {
	WebSocketManager,
	WSType,
	LiveType,
	LiveEvent,
	LiveStateSocket,
	LiveJoinSocket,
	LiveLikeSocket,
	LiveUpdateSocket,
	LiveEventStruct,
} from '.';
import { LiveInfo } from '../struct/';
import { SpoonClient } from '../spoon/';

export class LiveSocket extends WebSocketManager {

	private _liveToken!: string;
	private _healthInterval!: NodeJS.Timer;
	private _intervalMsec: number = 145000; // 2:25
	private _maxLengthPerSend: number = 100;

	constructor(
		private _live: LiveInfo,
		_client: SpoonClient,
		wstype: WSType = WSType.SYSTEM) {
		super(_client, wstype);
	}

	private health(): void {
		this.send({
			appversion: this.Client.appVersion,
			event: LiveEvent.LIVE_HEALTH,
			live_id: this.Live.id.toString(),
			type: LiveType.LIVE_RPT,
			useragent: this.Client.userAgent,
			user_id: this.Client.logonUser.id,
		});
	}

	get Live(): LiveInfo {
		return this._live;
	}

	get RoomToken(): string {
		return this._liveToken;
	}

	set RoomToken(val: string) {
		this._liveToken = val;
	}

	get Client(): SpoonClient {
		return this._client;
	}

	public message(message: string): void {
		const send = (text: string) => {
			if ( text.trim() === '' ) {
				return;
			}

			this.send({
				type: LiveType.LIVE_RPT,
				event: LiveEvent.LIVE_MESSAGE,
				appversion: this.Client.appVersion,
				useragent: this.Client.userAgent,
				token: this.Client.token,
				message: text.replace(/"/g, '\\"'),
			});
		}
		const splitted = message.split('\n');
		let str = '';
		while ( splitted.length ) {
			if ( str.length + splitted[0].length > this._maxLengthPerSend ) {
				send(str);
				str = '';
			}
			str += splitted.shift();
			if ( str.length > this._maxLengthPerSend ) {
				const deserialize = (text: string) => {
					const arr = text.split('');
					const ret = [];
					while ( arr.length ) {
						ret.push(arr.splice(0, this._maxLengthPerSend).join(''));
					}
					return ret;
				}

				for ( const s of deserialize(str) ) {
					send(s);
				}
				str = '';
			}
		}

		if ( str ) {
			send(str);
		}
	}

	public join (jwt: string): Promise<boolean> {
		this.RoomToken = jwt;
		return new Promise(async (resolve, reject) => {
			await this.connect(this.Client.urls.socket + this._live.id);

			this.send({
				live_id: this.Live.id.toString(),
				appversion: this.Client.appVersion,
				user_id: this.Client.logonUser.id,
				event: LiveEvent.LIVE_STATE,
				type: LiveType.LIVE_REQ,
				useragent: this.Client.userAgent,
			});
			this.once(LiveEvent.LIVE_STATE, (state: LiveStateSocket) => {
				this.send({
					live_id: this.Live.id.toString(),
					appversion: this.Client.appVersion,
					reconnect: false,
					retry: 0,
					token: `Bearer ${this.RoomToken}`,
					event: LiveEvent.LIVE_JOIN,
					type: LiveType.LIVE_REQ,
					useragent: this.Client.userAgent,
				});
				this.once(LiveEvent.LIVE_JOIN, (join: LiveJoinSocket) => {
					if ( join.result ) {
						if ( join.result.detail === 'success' ) {
							this.Client.liveMap.set(this.Live.id, this.Live);
							//this._healthInterval = setInterval(this.health.bind(this), this._intervalMsec) as NodeJS.Timer;
							this.on(LiveEvent.LIVE_EVENT_ALL, (evt: LiveLikeSocket|LiveJoinSocket|LiveUpdateSocket) => {
                                if ( evt.event === LiveEvent.LIVE_HEALTH ) {
                                    this.health();
                                }
								const data = evt.data;
								if ( data ) {
									const live = data.live;
									if ( live && evt.event !== LiveEvent.LIVE_MESSAGE ) {
										this._live = live;
									}
								}
							});
							resolve(true);
						}
					}
					reject(false);
				});
			});
		});
	}

	public destroy(): void {
		this.send({
			live_id: this.Live.id.toString(),
			appversion: this.Client.appVersion,
			event: LiveEvent.LIVE_HEALTH,
			type: LiveType.LIVE_RPT,
			useragent: this.Client.userAgent,
		});
		clearInterval(this._healthInterval);
		this.ws.close();
		this.destoryAllListener();
		this.Client.liveMap.delete(this.Live.id);
	}

}
