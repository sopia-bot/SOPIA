import { ipcRenderer, contextBridge } from "electron";
import { createSOPIAKey } from '../utils';
import { SOPIAFunction } from '../type';
import { SetUserDto } from "../dto/user.dto";
import { SetSpoonUserDto } from "../dto/spoon/user.dto";
import { SetLiveSettingDto } from "../dto";

(async () => {	
	const request = (url: string, ...args: any[]) => {
    console.log('ipc-transporter', '[REND -> MAIN]', url, ...args);
    return ipcRenderer.invoke('ipc-transporter', url, ...args)
			.then((args) => {
				console.log('ipc-transporter', '[MAIN -> REND]', url, args);
				return args;
			});
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
			setUser: (user: SetSpoonUserDto) => request('/spoon/user/set', user),
      getUser: () => request('/spoon/user/get'),
		},
    config: {
      setUser: (user: SetUserDto) => request('/config/user/set', user),
      getUser: () => request('/config/user/get'),
			setLiveSetting: (setting: SetLiveSettingDto) => request('/config/live/set', setting),
			getLiveSetting: () => request('/config/live/get'),
    },
	};

	contextBridge.exposeInMainWorld(`_sopia-${createSOPIAKey(version)}`, SOPIA);
	contextBridge.exposeInMainWorld(`version`, version);
})();