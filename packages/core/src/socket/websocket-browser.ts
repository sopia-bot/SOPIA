/*
 * websocket-browser.ts
 * Created on Fri Apr 30 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

export class WsClientBrowser extends WebSocket {
	constructor(url: string, option?: any) {
		super(url, option);
	}
}
