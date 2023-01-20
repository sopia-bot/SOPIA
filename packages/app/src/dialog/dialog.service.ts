import { Inject, Injectable } from '@nestjs/common';
import { BrowserWindow, dialog, OpenDialogOptions, SaveDialogOptions } from 'electron';

@Injectable()
export class DialogService {

	constructor(@Inject('BrowserWindow') private browserWindow: BrowserWindow) {}

	showOpenDialog(options: OpenDialogOptions) {
		return dialog.showOpenDialog(this.browserWindow, options);
	}

	showSaveDialog(options: SaveDialogOptions) {
		return dialog.showSaveDialog(this.browserWindow, options);
	}

}
