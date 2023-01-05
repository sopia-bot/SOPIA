import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { pathToRegexp, Key } from 'path-to-regexp';
import { Logger } from '@nestjs/common';

export class IpcTransporter extends Server implements CustomTransportStrategy {
	private readonly log = new Logger(IpcTransporter.name);

	listen(callback: () => void) {
		for ( const [url, handler] of this.messageHandlers ) {
			this.log.log(`Mapping event {${url}}`);
		}
		ipcMain.handle('ipc-transporter', async (event: IpcMainInvokeEvent, message: string, data: any) => {
			const entries = this.messageHandlers.entries();
			let item = entries.next();
			while ( !item.done ) {
				const [url, handler] = item.value;
				const keys: Key[] = [];
				const regexp = pathToRegexp(url, keys);
				const result = regexp.exec(message);
				if ( result ) {
					const context = Object.fromEntries(keys.map((key, idx) => [key.name, result[idx+1]]));
					return await handler({
						context,
						data,
					});
				}
				item = entries.next();
			}

			this.log.error(`Cannot find event url [${message}].`);
			return {
				status: 404,
				error: true,
				detail: `Cannot find event url [${message}].`,
			};
		});
		callback();
	}

	close() {}
}