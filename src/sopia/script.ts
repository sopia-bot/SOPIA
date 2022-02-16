/*
 * script.ts
 * Created on Wed Oct 14 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */
const fs = window.require('fs');
const path = window.require('path');
const vm = window.require('vm');

import CfgLite from '@/plugins/cfg-lite-ipc';
import SopiaContext from './context';
import logger from '@/plugins/logger';

export interface Context {
	__BUNDLE_NAME__: string;
	__BUNDLE_DIR__: string;
	sopia: SopiaContext;
	console: Console;
	atob: (str: string) => string;
	btoa: (str: string) => string;
	require: (p: string) => any;
	logger: any;
	cfg: CfgLite;
	Audio: any;
	module?: any;
	exports?: any;
}

export class Script {

	public contexts: any[] = [];

	constructor() {
		// empty
	}

	public async add(folder: string) {
		const index = path.join(folder, 'index.js');
		if ( fs.existsSync(index) ) {
			const context = window.require(index);
			this.contexts.push({
				name: path.basename(folder),
				dir: folder,
				context,
			});
		} else {
			logger.err('sopia', `Can not open script file [${index}].`);
		}
	}

	public clear() {
		if ( Array.isArray(this.contexts) ) {
			for ( const context of this.contexts ) {
				context.sopia.itv.clear();
			}
		}
		this.contexts = [];
	}

	public run(event: any, sock: any) {
		if ( Array.isArray(this.contexts) ) {
			for ( const { context } of this.contexts ) {
				if ( typeof context[event.event] === 'function' ) {
					context[event.event](event, sock);
				}
				//context.sopia.emit(event.event, event, sock);
			}
		}
	}

}

export default new Script();
