/*
 * cfg-lite-ipc.ts
 * Created on Sat Nov 28 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
 */

const { ipcRenderer } = window.require('electron');


export default class CfgLite {
	private readonly evtName: string = 'cfg-lite';

	constructor(private cfgFile: string, private privKey: string = '') {
		const ret = ipcRenderer.sendSync(this.evtName, 'new', this.cfgFile, this.privKey);
		if ( !ret ) {
			throw new Error(`Cannot open config file ${this.cfgFile},${this.privKey}`);
		}
	}


	public save(file?: string, removeBefore: boolean = false) {
		return ipcRenderer.sendSync(this.evtName, 'save', this.cfgFile, file, removeBefore);
	}

	public get(key?: string) {
		return ipcRenderer.sendSync(this.evtName, 'get', this.cfgFile, key);
	}

	public set(key: string, value: any) {
		if ( !key ) {
			throw Error('key is not valid');
		}
		return ipcRenderer.sendSync(this.evtName, 'set', this.cfgFile, key, value);
	}

	public merge(key: string, value: any) {
		if ( !key ) {
			throw Error('key is not valid');
		}
		return ipcRenderer.sendSync(this.evtName, 'merge', this.cfgFile, key, value);
	}

	public delete(key: string) {
		if ( !key ) {
			throw Error('key is not valid');
		}
		return ipcRenderer.sendSync(this.evtName, 'delete', this.cfgFile, key);
	}

	public deleteAll() {
		return ipcRenderer.sendSync(this.evtName, 'deleteAll', this.cfgFile);
	}

}
