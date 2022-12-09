/*
 * websocket.ts
 * Created on Fri Apr 30 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { EventEmitter } from '../utils/';
import { WSType, LiveEvent } from './enum/';
import * as EventStruct from './struct/';
import { deserialize } from 'typescript-json-serializer';
import { SpoonClient } from '../spoon/';

export class WebSocketManager extends EventEmitter {

	protected ws!: any;
	private debug: boolean = false;

	constructor(protected _client: SpoonClient, private engine: WSType) {
		super();
	}

	private eventMapper(socket: EventStruct.LiveEventStruct): EventStruct.LiveEventStruct {
		switch ( socket.event ) {
			case LiveEvent.LIVE_STATE:
				return deserialize<EventStruct.LiveStateSocket>(socket, EventStruct.LiveStateSocket);
			case LiveEvent.LIVE_JOIN:
				return deserialize<EventStruct.LiveJoinSocket>(socket, EventStruct.LiveJoinSocket);
			case LiveEvent.LIVE_RANK:
				return deserialize<EventStruct.LiveRankSocket>(socket, EventStruct.LiveRankSocket);
			case LiveEvent.LIVE_RANKLIST:
				return deserialize<EventStruct.LiveRankListSocket>(socket, EventStruct.LiveRankListSocket);
			case LiveEvent.LIVE_MESSAGE:
				return deserialize<EventStruct.LiveMessageSocket>(socket, EventStruct.LiveMessageSocket);
			case LiveEvent.LIVE_LAZY_UPDATE:
				return deserialize<EventStruct.LiveLazyUpdateSocket>(socket, EventStruct.LiveLazyUpdateSocket);
			case LiveEvent.LIVE_LIKE:
				return deserialize<EventStruct.LiveLikeSocket>(socket, EventStruct.LiveLikeSocket);
			case LiveEvent.LIVE_PRESENT:
				return deserialize<EventStruct.LivePresentSocket>(socket, EventStruct.LivePresentSocket);
			case LiveEvent.LIVE_UPDATE:
				return deserialize<EventStruct.LiveUpdateSocket>(socket, EventStruct.LiveUpdateSocket);
			case LiveEvent.LIVE_PLAY:
				return deserialize<EventStruct.LivePlaySocket>(socket, EventStruct.LivePlaySocket);
            case LiveEvent.LIVE_PRESENT_LIKE:
                return deserialize<EventStruct.LivePresentLikeSocket>(socket, EventStruct.LivePresentLikeSocket);
		}
		return socket;
	}

	private receiver( msg: MessageEvent ): void {
		const data: any = JSON.parse(msg.data);
		if ( this.debug ) {
			console.log('[CLIENT] <- [SERVER]', msg.data);
		}
		const m = this.eventMapper(data);
		this._client.hook.emit('ws:response', m);
		this.emit(m.event, m);
		this.emit(LiveEvent.LIVE_EVENT_ALL, m);
	}

	async connect ( url: string, option?: any ): Promise<boolean> {
		return new Promise((resolve, reject) => {
			try {
				if ( (this.engine === WSType.SYSTEM && typeof window !== 'undefined') || (this.engine === WSType.WEB) ) {
					const { WsClientBrowser } = require('./websocket-browser');
					this.ws = new WsClientBrowser(url, option);
				} else {
					const { WsClientNode } = require('./websocket-node');
					this.ws = new WsClientNode(url);
				}
				this.ws.onmessage = this.receiver.bind(this);
				this.ws.onerror = console.error;
				this.ws.onclose = () => { /* empty */ };
				this.ws.onopen = () => {
					resolve(true);
				};
			} catch(err) {
				reject(err);
			}
		});
	}

	send ( data: any ): void {
		const sendData: any = data;
		this._client.hook.emit('ws:request', data);
		if ( sendData.token ) {
			if ( !sendData.token.match(/^Bearer/) ) {
				sendData.token = 'Bearer ' + sendData.token;
			}
		}
		const strData: string = JSON.stringify(sendData);
		if ( this.debug ) {
			console.log('[CLIENT] -> [SERVER]', strData);
		}
		this.ws.send(strData);
	}

}
