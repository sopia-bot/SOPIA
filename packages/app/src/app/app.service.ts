import { Injectable, Inject } from '@nestjs/common';
import { BrowserWindow, app } from 'electron';

@Injectable()
export class AppService {

	constructor(@Inject('BrowserWindow') private browserWindow: BrowserWindow) {}

	minimize() {
		return this.browserWindow.minimize();
	}

	maximize() {
		return this.browserWindow.maximize();
	}

	toggleMaximize() {
		if ( this.browserWindow.isMaximized() ) {
			return this.browserWindow.unmaximize();
		}
		return this.browserWindow.maximize();
	}

	quit() {
		return app.quit();
	}

	version() {
		return app.getVersion();
	}

}
