// Modules to control application life and create native browser window
const {app, BrowserWindow, session, ipcMain, dialog} = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const open = require('open');


global.DEBUG_MODE = false;
process.argv.forEach((arg) => {
	if ( arg === "DEBUG" ) {
		let exePath = app.getPath('exe');
		let exe = path.basename(exePath);
		global.DEBUG_MODE = true;
	}
});
process.setMaxListeners(200);

/**
 * @function getPath
 * @param {string} path_
 * 현재 프로그램이 시작된 경로를 기준으로,
 * @path_ 의 절대 경로를 반환한다.
 * @cur true 면 electron.exe 검사를 안 한다.
 */
const getPath = (path_, cur = false) => {
	let exePath = app.getPath('exe');
	let exe = path.basename(exePath);
	let p = app.getAppPath();
	if ( !exe.match("electron") && cur === false ) {
		p = path.dirname(exePath);
	}
	return path.join(p, path_);
};
/** 
 * @function verCompaire
 * @param {String} ver1
 * @param {String} ver2
 * @returns -1: ver1 < ver2 0: ver1 = ver2 1: ver1 > ver2
 */
const verCompaire = (ver1, ver2) => {
	const v1 = parseVersion(ver1);
	const v2 = parseVersion(ver2);
	
	if ( v1 === false || v2 === false ) return;
	
	if ( v1.app === v2.app ) {
		if ( v1.major === v2.major ) {
			if ( v1.minor === v2.minor ) {
				return 0;
			} else {
				return (v1.minor < v2.minor ? -1 : 1);
			}
		} else {
			return (v1.major < v2.major ? -1 : 1);
		}
	} else {
		return (v1.app < v2.app ? -1 : 1);
	}
};
const parseVersion = (ver) => {
	if ( typeof ver !== "string" ) return false;

	const sVer = ver.split('.');
	if ( sVer.length === 3 ) {
		return {
			app:   parseInt(sVer[0], 10),
			major: parseInt(sVer[1], 10),
			minor: parseInt(sVer[2], 10),
		};
	}
	return false;
};

const config = require(getPath('config.json'));
const checkUpdate = async (version = '') => {
	const res = await axios.get('https://sopia-bot.firebaseio.com/app/update/version.json');
	const newVer = res.data.replace(/^\"|\"$/, '');
	if ( verCompaire(version, newVer) == -1 ) {
        open(`https://sopia-bot.github.io/release/#${newVer}`);
		const child = spawn(getPath('SOPIAUpdater.exe'), [ getPath('/') ], {
			detached: true,
			stdio: [ 'ignore', 'ignore', 'ignore' ],
		});
		child.unref();
		process.exit(0);
	}
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;


function recordWindow () {
	rcWindow = new BrowserWindow({
		width: 600,
		height: 300,
		minWidth: 500,
		minHeight: 300,
		webPreferences: {
			webviewTag: true,
			nodeIntegration: true,
			preload: ''
		},
	});

	rcWindow.setMenu(null);
	rcWindow.loadFile('src/recoder.html');
	rcWindow.on('closed', function (cb, d) {
		rcWindow = null;
	});
}

ipcMain.on('openRecordWindow', (event) => {
	ipcMain.once('RecordReturnValue', (e, file) => {
		event.reply('RecordReturnValue', file);
	});
	recordWindow();
});


function createWindow () {
	// Load before window size
	let width = 1280;
	let height = 720;
	if ( typeof config.size === 'object' ) {
		width = config.size.width;
		height = config.size.height;
	}

	// Create the browser window.
	mainWindow = new BrowserWindow({
		width,
		height,
		minWidth: 500,
		minHeight: 400,
		webPreferences: {
			webviewTag: true,
			nodeIntegration: true,
			preload: ''
		},
		show: false,
	});

	ipcMain.on('openDevTool', () => {
		mainWindow.webContents.openDevTools();
	});

	if ( !global.DEBUG_MODE ) {
		mainWindow.setMenu(null);
	}

	mainWindow.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Whale/2.8.105.22 Safari/537.36');
	// and load the index.html of the app.
	mainWindow.loadFile('src/index.html', {
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Whale/2.8.105.22 Safari/537.36',
	});

	// Open the DevTools.
	if ( DEBUG_MODE ) {
		mainWindow.webContents.openDevTools();
	}

	mainWindow.on('ready-to-show', () => {
		try {
			if ( DEBUG_MODE ) {
				session.defaultSession.cookies.flushStore();
				session.defaultSession.cookies.get({}, (error, cookies) => {
					cookies.forEach((cookie) => {
						let url = '';
						// get prefix, like https://www.
						url += cookie.secure ? 'https://' : 'http://';
						url += cookie.domain.charAt(0) === '.' ? 'www' : '';
						// append domain and path
						url += cookie.domain;
						url += cookie.path;
		
						session.defaultSession.cookies.remove(url, cookie.name, (error) => {
							if (error) console.log(`error removing cookie ${cookie.name}`, error);
						});
					});
				});
			}
			session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
				details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Whale/2.8.105.22 Safari/537.36';
				callback({ cancel: false, requestHeaders: details.requestHeaders });
			});
			session.defaultSession.cookies.set({
				url: 'https://youtube.com',
				name: 'VISITOR_INFO1_LIVE',
				value: 'jVdvrRqAjLg',
			});
		} catch (err) {
			console.error(err);
		}
		mainWindow.show();
	});

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
	await checkUpdate(config.version);
	createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	//if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
