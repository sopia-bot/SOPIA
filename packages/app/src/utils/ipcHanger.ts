import { ipcMain, IpcMainEvent, IpcMainInvokeEvent } from "electron";

class IpcHangerWrapper {

	constructor() {
		this.callback = this.callback.bind(this);
	}

	private logger(channel: string, ...args: any[]) {
		console.log('Receive ipc event', channel, ...args);
	}

	private callback(channel: string, onEvent: (...args: any[]) => any) {
		return async (event: IpcMainEvent|IpcMainInvokeEvent, ...args: any[]) => {
			this.logger(channel, ...args);
			return await onEvent(event, ...args);
		}
	}

	on(channel: string, onEvent: (event: IpcMainEvent, ...args: any[]) => void) {
		return ipcMain.on(channel, this.callback(channel, onEvent));
	}

	handle(channel: string, onEvent: (event: IpcMainInvokeEvent, ...args: any[]) => any) {
		return ipcMain.handle(channel, this.callback(channel, onEvent));
	}
}
export const ipcHanger = new IpcHangerWrapper();