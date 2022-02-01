/*
 * script.ts
 * Created on Wed Oct 14 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */
const fs = window.require('fs');
const path = window.require('path');
import logger from '@/plugins/logger';

export class Script {
	private files: string[] = [];
	private binds: any = {};

	constructor() {
		// empty
	}

	public add(folder: string) {
		const index = path.join(folder, 'index.js');
		if ( fs.existsSync(index) ) {
			const module: any = window.require(index);
			for ( const [key, func] of Object.entries(module) ) {
				if ( key === 'bootstrap' ) {
					(func as () => void)();
				} else {
					if ( this.binds[key] ) {
						this.binds[key].push(func);
					} else {
						this.binds[key] = [ func ];
					}
				}
			}
		} else {
			logger.err('sopia', `Can not open script file [${index}].`);
		}
	}

	public clear() {
		this.binds = [];
		this.files = [];
	}

	public run(event: any, sock: any) {
		if ( Array.isArray(this.binds[event.event]) ) {
			for ( const module of this.binds[event.event] ) {
				module(event, sock);
			}
		}
	}

}

export default new Script();
