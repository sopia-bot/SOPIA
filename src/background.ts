/*
 * background.ts
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
 */
'use strict';

import { app, session, protocol, BrowserWindow, ipcMain, dialog, IpcMainEvent } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import path from 'path';
import CfgLite from 'cfg-lite';
import { ZipFile, ZipArchive } from '@arkiv/zip';


const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36';
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
	ZipFile.CreateFromDirectory(src, dst);
	evt.returnValue = true;
});

ipcMain.on('zip:uncompress-buffer', (evt: IpcMainEvent, b64str: string, dst: string) => {
	const archive = new ZipArchive('', Buffer.from(b64str, 'base64'));
	archive.ExtractAll(dst);
	evt.returnValue = true;
});

ipcMain.handle('open-dialog', async (event, options: any) => {
	return await dialog.showOpenDialog(options);
});


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
	{ scheme: 'app', privileges: { secure: true, standard: true } },
]);

declare global {
	namespace NodeJS {
		interface Global {
			startTime: string;
			snsLoginOpen: (u: string) => Promise<any>;
		}
	}
}

console.log('Developement:', isDevelopment);
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

const buildTime = (time: Date) => {
	const yyyy = time.getFullYear();
	const mm = (time.getMonth() + 1).toString().padStart(2, '0');
	const dd = (time.getDate()).toString().padStart(2, '0');

	const hh = time.getHours().toString().padStart(2, '0');
	const MM = time.getMinutes().toString().padStart(2, '0');
	const ss = time.getSeconds().toString().padStart(2, '0');

	return `${yyyy}${mm}${dd}-${hh}${MM}${ss}`;
};
global.startTime = buildTime(new Date());

global.snsLoginOpen = function(url: string) {
	return new Promise((resolve, reject) => {
		const snsBrowser = new BrowserWindow({
			width: 800,
			height: 800,
			show: false,
		});
		snsBrowser.webContents.setUserAgent(USER_AGENT);

		snsBrowser.show();

		snsBrowser.once('close', (evt: any) => {
			const sender = evt.sender;
			const webContents = sender.webContents;

			const tout = setTimeout(() => {
				reject(new Error('Faild get localStorage data. (Timeout)'));
				if ( !snsBrowser.isDestroyed() ) {
					evt.sender.close();
				}
			}, 5000);

			webContents.executeJavaScript(`localStorage.getItem('SPOONCAST_requestBySnsLogin')`)
				.then((res: string) => {
					resolve(JSON.parse(res).result);
				})
				.catch(reject)
				.finally(() => {
					clearTimeout(tout);
					evt.sender.close();
				});

			evt.preventDefault();
		});

		snsBrowser.loadURL(url, {
			userAgent: USER_AGENT,
		});
	});
};

// https://pratikpc.medium.com/bypassing-cors-with-electron-ab7eaf331605
function UpsertKeyValue(obj: Record<string, string|string[]>|undefined, keyToChange: string, value: string[]) {
	const keyToChangeLower = keyToChange.toLowerCase();
	if ( !obj ) {
		return;
	}
	for (const key of Object.keys(obj)) {
		if (key.toLowerCase() === keyToChangeLower) {
			// Reassign old key
			obj[key] = value;
			// Done
			return;
		}
	}
	// Insert at end instead
	obj[keyToChange] = value;
}

const createWindow = () => {
	// Create the browser window.
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			// Use pluginOptions.nodeIntegration, leave this alone
			// See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
			nodeIntegration: true,
			enableRemoteModule: true,
			webSecurity: !isDevelopment,
		},
	});

	win.webContents.session.webRequest.onBeforeSendHeaders(
		(details, callback) => {
			const { requestHeaders } = details;
			UpsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', ['*']);
			callback({
				requestHeaders,
			});
		},
	);

	win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
		const { responseHeaders } = details;
		UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*']);
		UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*']);
		callback({
			responseHeaders,
		});
	});

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
		if (!process.env.IS_TEST) { win.webContents.openDevTools(); }
	} else {
		createProtocol('app');
		// Load the index.html when not in development
		win.loadURL('app://./index.html');
	}

	win.on('closed', () => {
		win = null;
	});
};

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		details.requestHeaders['User-Agent'] = '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36';
		details.requestHeaders['Accept-Encoding'] = 'gzip, deflate, br';
		callback({ cancel: false, requestHeaders: details.requestHeaders });
	});

	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		try {
			await installExtension(VUEJS_DEVTOOLS);
		} catch (e) {
			console.error('Vue Devtools failed to install:', e.toString());
		}
	}
	createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
	if (process.platform === 'win32') {
		process.on('message', (data) => {
			if (data === 'graceful-exit') {
				app.quit();
			}
		});
	} else {
		process.on('SIGTERM', () => {
			app.quit();
		});
	}
}
