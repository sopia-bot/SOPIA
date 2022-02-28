/*
 * script.ts
 * Created on Wed Oct 14 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */
const fs = window.require('fs');
const path = window.require('path');
import './context';

import logger from '@/plugins/logger';

export class Script {

	public boxs: any[] = [];

	constructor() {
		this.add = this.add.bind(this);
		this.abort = this.abort.bind(this);
		this.clear = this.clear.bind(this);
		this.run = this.run.bind(this);
		this.reload = this.reload.bind(this);
	}

	public async add(folder: string) {
		const index = path.join(folder, 'index.js');
		if ( fs.existsSync(index) ) {
			const name = path.basename(folder);
			const context = (window as any)['bctx'].new(name);
			const module = window.require(index);
			const box = {
				name,
				file: index,
				dir: folder,
				module,
				context,
			};
			this.boxs.push(box);
		} else {
			logger.err('sopia', `Can not open script file [${index}].`);
		}
	}

	public abort(name: string) {
		const idx = this.boxs.findIndex((b: any) => b.name === name);
		const box = this.boxs[idx];
		if ( box ) {
			(window as any)['bctx'].destroy(name);
			delete window.require.cache[box.file];
			this.boxs.splice(idx, 1);
		}
	}

	public clear() {
		if ( Array.isArray(this.boxs) ) {
			for ( const module of this.boxs ) {
				this.abort.call(this, module.name);
			}
		}
		this.boxs = [];
	}

	public run(event: any, sock: any) {
		if ( Array.isArray(this.boxs) ) {
			for ( const { module } of this.boxs ) {
				if ( typeof module[event.event] === 'function' ) {
					module[event.event](event, sock);
				}
			}
		}
	}

	public reload(name: string) {
		const box = this.boxs.find((b: any) => b.name === name);
		if ( box ) {
			this.abort(name);
			this.add(box.dir);
		}
	}

}

export default new Script();
