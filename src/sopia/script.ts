/*
 * script.ts
 * Created on Wed Oct 14 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */
const fs = window.require('fs');
const path = window.require('path');
const vm = window.require('vm');
import SopiaContext from './context';
import logger from '@/plugins/logger';

interface Context {
	sopia: SopiaContext;
	console: Console;
	require: (p: string) => any;
	logger: any;
}

export class Script {
	private contexts: Context[] = [];

	constructor() {
		// empty
	}

	public add(folder: string) {
		const index = path.join(folder, 'index.js');
		if ( fs.existsSync(index) ) {
			const source: string = fs.readFileSync(index, 'utf8');
			const script = new vm.Script(source);
			const context: Context = this.createNewContext(index);
			try {
				script.runInNewContext(context, {
					displayErrors: true,
				});
				this.contexts.push(context);
			} catch (err) {
				console.error(err);
			}
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
			for ( const context of this.contexts ) {
				context.sopia.emit(event.event, event, sock);
			}
		}
	}

	private createNewContext(index: string): Context {
		const folder = path.dirname(index);
		const context = {
			sopia: new SopiaContext(index),
			console,
			atob,
			btoa,
			require: (p: string) => {
				const module = {
					exports: {},
				};
				const tmpCtx = vm.createContext({
					...context,
					module,
					exports: module.exports,
				});
				const t = path.resolve(folder, p);
				if ( fs.existsSync(t) ) {
					const source = fs.readFileSync(t, 'utf8');
					const script = new vm.Script(source);
					script.runInNewContext(tmpCtx);
					return tmpCtx.module.exports;
				}
				return window.require(p);
			},
			logger,
		};
		return context;
	}

}

export default new Script();
