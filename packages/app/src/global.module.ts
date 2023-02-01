import { Module, Global } from '@nestjs/common';
import { BrowserWindow } from './utils/window.provider';
import { SpoonClient } from './spoon/client.provider';

@Global()
@Module({
	providers: [
		BrowserWindow,
		SpoonClient,
	],
	exports: [BrowserWindow.provide, SpoonClient.provide],
})
export class GlobalModule {}