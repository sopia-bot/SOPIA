import { ipcRenderer, contextBridge } from "electron";
import { createSOPIAKey } from '../utils';
import { SOPIAFunction } from '../type';
import { SetUserDto } from "../dto/user.dto";

(async () => {	
	const request = (url: string, ...args: any[]) => {
    console.log('ipc-transporter', '[REND -> MAIN]', url, ...args);
    return ipcRenderer.invoke('ipc-transporter', url, ...args);
  }
	const version = await request('/app/version');

	const SOPIA: SOPIAFunction = {
		request,
		app: {
			minimize: () => request('/app/minimize'),
			maximize: () => request('/app/maximize'),
			toggleMaximize: () => request('/app/toggle-maximize'),
			quit: () => request('/app/quit'),
		},
		spoon: {
			//snsLogin: async (url: string) => await ipcRenderer.invoke('sns-login-open', url),
			snsLogin: (url: string) => request('/spoon/sns-login-open', url),
		},
    config: {
      setUser: (user: SetUserDto) => request('/config/user/set', user),
      getUser: () => request('/config/user/get'),
    },
	};

	contextBridge.exposeInMainWorld(`_sopia-${createSOPIAKey(version)}`, SOPIA);
	contextBridge.exposeInMainWorld(`version`, version);
})();