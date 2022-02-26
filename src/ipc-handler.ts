import path from 'path';
import { app, ipcMain, IpcMainEvent, dialog } from 'electron';

import CfgLite from 'cfg-lite';
import { ZipFile, ZipArchive } from '@arkiv/zip';

const isDevelopment = process.env.NODE_ENV !== 'production';

const CfgList: any = {};
const getPath = (type: any, ...args: any) => path.resolve(app.getPath(type), ...args);

ipcMain.on('cfg-lite', (evt: IpcMainEvent, prop: string, file: string, ...args: any) => {
	const key = path.basename(file);
	let rtn: any = null;
	if ( prop === 'new' ) {
		CfgList[key] = new CfgLite(file, args[0]);
	} else {
		if ( typeof CfgList[key][prop] === 'function' ) {
			rtn = CfgList[key][prop](...args);
		} else {
			rtn = CfgList[key][prop];
		}
	}

	evt.returnValue = rtn;
});

ipcMain.on('zip:create', (evt: IpcMainEvent, src: string, dst: string) => {
	console.log('zip:create', src, dst);
	try {
		ZipFile.CreateFromDirectory(src, dst);
		evt.returnValue = true;
	} catch (err) {
		console.error(err);
		evt.returnValue = false;
	}
});

ipcMain.on('zip:uncompress-buffer', (evt: IpcMainEvent, b64str: string, dst: string) => {
	console.log('zip:uncompress-buffer', dst);
	const archive = new ZipArchive('', Buffer.from(b64str, 'base64'));
	archive.ExtractAll(dst);
	evt.returnValue = true;
});

ipcMain.on('isdev', (evt: IpcMainEvent) => {
	evt.returnValue = isDevelopment;
});

ipcMain.handle('open-dialog', async (event, options: any) => {
	return await dialog.showOpenDialog(options);
});