import { BrowserWindow as ElectronBrowserWindow } from 'electron';

let window: ElectronBrowserWindow|null = null;

export function createBrowserWindow(options: ConstructorParameters<typeof ElectronBrowserWindow>[0]) {
	window = new ElectronBrowserWindow(options);
	return window;
}

export const BrowserWindow = {
	provide: 'BrowserWindow',
	useFactory() {
		return window;
	},
}

export function useBrowserWindow() {
  return window;
}