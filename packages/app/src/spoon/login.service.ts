import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import { app, BrowserWindow } from 'electron';
import { existsSync } from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const launcher = function(cmd: string) {
	try {
		return execSync(cmd).toString('utf8').replace(/\n/g , '');
	} catch {
		return '';
	}
};

function pickProgram(list: string[]) {
	for ( const item of list ) {
		if ( existsSync(item) ) {
			return item;
		}
	}
	return '';
}

@Injectable()
export class LoginService {

	private snsLoginHandler(url: string) {
		return new Promise(async (resolve, reject) => {
			let res = await this.snsLoginOpenByPuppeteer(url);
			if ( res ) {
				resolve(res);
				return;
			}
		
			res = await this.snsLoginOpenByElectron(url);
			if ( res ) {
				resolve(res);
				return;
			}
			reject();
		});
	}

	private snsLoginOpenByPuppeteer(url: string) {
		return new Promise(async (resolve, reject) => {
			let executablePath = '';
			if ( process.platform === 'win32' ) {
				executablePath = pickProgram([
					path.join(app.getPath('userData'), 'firefox', 'firefox.exe'),
					`C:\\Program Files\\Mozilla Firefox\\firefox.exe`,
					`C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe`,
					`C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe`,
					`C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe`,
				]);
			} else if ( process.platform === 'linux' ) {
				executablePath = pickProgram([
					'/home/youn/Utils/firefox/firefox', // for develop
					launcher('which brave-browser'),
					launcher('which google-chrome'),
					launcher('which firefox'),
					launcher('which chrome'),
					launcher('which chromium'),
				]);
			}
		
			if ( executablePath === '' ) {
				console.log(`Can not find supported browser list.`);
				reject();
				return;
			}
		
			const browser = await puppeteer.launch({
				executablePath,
				headless: false,
				defaultViewport: null,
				product: path.parse(executablePath).name === 'firefox' ? 'firefox' : 'chrome',
				//args,
			});
		
			const [page] = await browser.pages();
			await page.goto(url);
			page.on('framenavigated', async (frame) => {
				try {
					const furl = frame.url();
					const parsedUrl = new URL(furl);
					if ( parsedUrl.host === 'www.spooncast.net' ) {
						let res = await page.evaluate(`localStorage.getItem('SPOONCAST_requestBySnsLogin')`);
		
						for ( let i = 0; i < 5 && !res; i++ ) {
							await sleep(1000);
							res = await page.evaluate(`localStorage.getItem('SPOONCAST_requestBySnsLogin')`);
						}
		
						browser.close();
		
						try {
							resolve(JSON.parse(res).result);
						} catch {
							reject();
						}
					}
				} catch {
					
				}
			});
		});
	}
	
	private snsLoginOpenByElectron(url: string) {
		return new Promise((resolve, reject) => {
			const snsBrowser = new BrowserWindow({
				width: 800,
				height: 800,
				webPreferences: {
					contextIsolation: false,
					webSecurity: false,
				},
				show: false,
			});
			//snsBrowser.webContents.setUserAgent();
	
			snsBrowser.show();
	
			snsBrowser.on('close', (evt: any) => {
				console.log('why not call close');
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
				//userAgent: USER_AGENT,
			});
		});
	};

	async snsLoginOpen(url: string) {
		try {
			return await this.snsLoginHandler(url);
		} catch (err) {
			return;
		}
	}	

}
