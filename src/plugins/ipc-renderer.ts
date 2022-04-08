const { ipcRenderer } = window.require('electron');
import { InstallItem, InstallOptions } from 'npkgi';

export const getAppPath = (type: string) =>
	ipcRenderer.sendSync('app:get-path', type);

export const getStartTime = () =>
	ipcRenderer.sendSync('start-time');

export const snsLoginOpen = (url: string) =>
	ipcRenderer.invoke('sns-login-open', url);

export const npmInstall = (list: InstallItem[], options: InstallOptions) =>
	ipcRenderer.invoke('npm:install', list, options);
