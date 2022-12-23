import { ipcRenderer, contextBridge } from "electron";

declare global {
	interface Window {
		_sopia: SOPIAFunction;
	}
}

interface SOPIAFunction {
	app: {
		minimize: () => void;
		maximize: () => void;
		quit: () => void;
	}
}

contextBridge.exposeInMainWorld('_sopia', {
	app: {
		minimize: () => ipcRenderer.send('app:minimize'),
		maximize: () => ipcRenderer.send('app:maximize'),
		quit: () => ipcRenderer.send('app:quit'),
	}
});