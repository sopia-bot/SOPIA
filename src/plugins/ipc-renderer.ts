const { ipcRenderer } = window.require('electron');

export const getAppPath = (type: string) =>
	ipcRenderer.sendSync('app:get-path', type);

export const getStartTime = () =>
	ipcRenderer.sendSync('start-time');

export const snsLoginOpen = (url: string) =>
	ipcRenderer.invoke('sns-login-open', url);
