/*
 * websocket-node.ts
 * Created on Fri Apr 30 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import WebSocket from 'ws';

export class WsClientNode extends WebSocket {

	constructor(url: string) {
		super(url, {
			headers: {
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
			},
		});
	}

	close() {
		this.terminate();
	}

}
