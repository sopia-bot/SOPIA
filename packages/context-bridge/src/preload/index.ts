import { ipcRenderer, contextBridge } from "electron";
import { createSOPIAKey } from '../utils';
import { SOPIAFunction } from '../type';

const version = ipcRenderer.sendSync('app:version');

const SOPIA: SOPIAFunction = {
	app: {
		minimize: () => ipcRenderer.send('app:minimize'),
		maximize: () => ipcRenderer.send('app:maximize'),
		toggleMaximize: () => ipcRenderer.send('app:toggleMaximize'),
		quit: () => ipcRenderer.send('app:quit'),
	}
};

contextBridge.exposeInMainWorld(`_sopia-${createSOPIAKey(version)}`, SOPIA);
contextBridge.exposeInMainWorld(`version`, version);