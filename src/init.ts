import path from 'path';
import fs from 'fs';
import { app, BrowserWindow } from 'electron';

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36';

/* INIT DIR */
const bundleDir = path.join(app.getPath('userData'), 'bundles');
if ( !fs.existsSync(bundleDir) ) {
	fs.mkdirSync(bundleDir);
}

const sopiaDir = path.join(app.getPath('userData'), 'sopia');
if ( !fs.existsSync(sopiaDir) ) {
	fs.mkdirSync(sopiaDir);
}

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