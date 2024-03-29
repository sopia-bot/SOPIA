import { ipcRenderer, contextBridge, OpenDialogOptions, SaveDialogOptions } from "electron";
import { createSOPIAKey } from '../utils';
import { SOPIAFunction } from '../type';
import { SetUserDto } from "../dto/user.dto";
import { SetSpoonUserDto } from "../dto/spoon/user.dto";
import { SetLiveSettingDto, SetStreamDto } from "../dto";
import { readFile, writeFile } from "fs/promises";
import path from 'path';
import { ApiLivesCreate } from "@sopia-bot/core/dist";

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
			snsLogin: (url: string) => request('/spoon/sns-login-open', url),
			setUser: (user: SetSpoonUserDto) => request('/spoon/user/set', user),
      getUser: () => request('/spoon/user/get'),
			createLive: (prop: ApiLivesCreate.Request) => request('/spoon/live/create', prop),
			livePush: (chunk: Buffer) => request('/spoon/live/push', chunk),
		},
    config: {
      setUser: (user: SetUserDto) => request('/config/user/set', user),
      getUser: () => request('/config/user/get'),
			setLiveSetting: (setting: SetLiveSettingDto) => request('/config/live/set', setting),
			getLiveSetting: () => request('/config/live/get'),
			setStreamSetting: (setting: SetStreamDto) => request('/config/stream/set', setting),
			getStreamSetting: () => request('/config/stream/get'),
    },
		dialog: {
			open: (options: OpenDialogOptions) => request('/dialog/open', options),
			save: (options: SaveDialogOptions) => request('/dialog/save', options),
		},
		node: {
			fs: {
				readFile,
				writeFile,
			},
			path,
		},
	};

	contextBridge.exposeInMainWorld(`_sopia-${createSOPIAKey(version)}`, SOPIA);
	contextBridge.exposeInMainWorld(`version`, version);
})();