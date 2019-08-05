// Modules to control application life and create native browser window
const {app, BrowserWindow, session} = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

try {
	session.defaultSession.cookies.flushStore();
	session.webContents.session.clearCache();
	session.webContents.session.clearStorageData([]);
	session.webContents.session.flushStorageData();
	
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
} catch {

}

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		minWidth: 500,
		minHeight: 400,
		webPreferences: {
			webviewTag: true,
			nodeIntegration: true,
			preload: ''
		},
	})
	
	// and load the index.html of the app.
	mainWindow.loadFile('src/index.html')
	
	// Open the DevTools.
	//mainWindow.webContents.openDevTools()
	
	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
