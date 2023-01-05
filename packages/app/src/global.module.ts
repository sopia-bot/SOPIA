import { Module, Global } from '@nestjs/common';
import { BrowserWindow } from './utils/window.provider';

@Global()
@Module({
	providers: [
		BrowserWindow,
	],
	exports: [BrowserWindow.provide],
})
export class GlobalModule {}