import { ipcRenderer, contextBridge, OpenDialogOptions, SaveDialogOptions } from "electron";
import { createSOPIAKey } from '../utils';
import { SOPIAFunction } from '../type';
import { SetUserDto } from "../dto/user.dto";
import { SetSpoonUserDto } from "../dto/spoon/user.dto";
import { AddTrackDto, DeleteTrackDto, RecordStartDto, SetLiveSettingDto, SetRecordDto, SetStreamDto, SetTrackDto } from "../dto";
import { readFile, writeFile } from "fs/promises";
import path from 'path';
import { ApiLivesCreate } from "@sopia-bot/core/dist";
import { AudioOptions } from 'naudiodon';

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
  const ipcEventStore = new Map<string, any>();

	const SOPIA: SOPIAFunction = {
		request,
		app: {
			minimize: () => request('/app/minimize'),
			maximize: () => request('/app/maximize'),
			toggleMaximize: () => request('/app/toggle-maximize'),
			quit: () => request('/app/quit'),
      getDevices: () => request('/app/record/devices'),
      recording: {
        start: (option: RecordStartDto) => request('/app/record/start', option),
        getRecordChunk: (uid: string) => request('/app/record/get', uid),
        status: (uid: string) => request('/app/record/status', uid),
        stop: (uid: string) => request('/app/record/stop', uid),
      },
		},
		spoon: {
			snsLogin: (url: string) => request('/spoon/sns-login-open', url),
			setUser: (user: SetSpoonUserDto) => request('/spoon/user/set', user),
      getUser: () => request('/spoon/user/get'),
			createLive: (prop: ApiLivesCreate.Request) => request('/spoon/live/create', prop),
      settingLive: (url: string) => request('/spoon/live/setting', url),
      closeLive: () => request('/spoon/live/close'),
			livePush: (chunk: Buffer) => request('/spoon/live/push', chunk),
		},
    config: {
      setUser: (user: SetUserDto) => request('/config/user/set', user),
      getUser: () => request('/config/user/get'),
			setLiveSetting: (setting: SetLiveSettingDto) => request('/config/live/set', setting),
			getLiveSetting: () => request('/config/live/get'),
			setStreamSetting: (setting: SetStreamDto) => request('/config/stream/set', setting),
			getStreamSetting: () => request('/config/stream/get'),
      getTrackList: () => request('/config/track/get'),
      addTrack: (track: AddTrackDto) => request('/config/track/add', track),
      setTrack: (track: SetTrackDto) => request('/config/track/set', track),
      deleteTrack: (track: DeleteTrackDto) => request('/config/track/delete', track),
      setRecord: (setting: SetRecordDto) => request('/config/record/set', setting),
      getRecord: () => request('/config/record/get'),
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
      electron: {
        ipcRenderer: {
          ...ipcRenderer,
          on: (key: string, callback: any): any => {
            if ( ipcEventStore.has(key) ) {
              ipcRenderer.off(key, ipcEventStore.get(key));
              ipcEventStore.delete(key);
            }
            ipcEventStore.set(key, callback);
            ipcRenderer.on(key, callback);
          },
          off: (key: string): any => {
            if ( ipcEventStore.has(key) ) {
              ipcRenderer.off(key, ipcEventStore.get(key));
            }
          },
        },
      },
		},
	};

	contextBridge.exposeInMainWorld(`_sopia-${createSOPIAKey(version)}`, SOPIA);
	contextBridge.exposeInMainWorld(`version`, version);
})();