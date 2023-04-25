import { ApiLivesCreate, LogonUser } from "@sopia-bot/core";
import { OpenDialogOptions, OpenDialogReturnValue, SaveDialogOptions, SaveDialogReturnValue, ipcRenderer } from "electron";
import { AddTrackDto, DeleteTrackDto, RecordStartDto, SetLiveSettingDto, SetRecordDto, SetStreamDto, SetTrackDto } from "./dto";
import { SetSpoonUserDto } from "./dto/spoon/user.dto";
import { SetUserDto } from "./dto/user.dto";
import { LiveSettingEntity } from "./entities/live-setting.entity";
import { SpoonUserEntity } from "./entities/spoon/user.entity";
import { UserEntity } from "./entities/user.entity";
import { readFile, writeFile } from "fs/promises";
import path from 'path';
import { RecordSettingEntity, StreamSettingEntity, TrackEntity } from "./entities";
import { AudioOptions, DeviceInfo } from 'naudiodon';

export interface LiveCreated extends ApiLivesCreate.Response {
  publishUrl: string;
}


export interface SOPIAFunction {
  request: (url: string, ...args: any[]) => Promise<any>,
  app: {
    minimize: () => void;
    maximize: () => void;
    toggleMaximize: () => void;
    quit: () => void;
    getDevices: () => Promise<DeviceInfo[]>;
    recording: {
      start: (option: RecordStartDto) => Promise<void>;
      status: (uid: string) => Promise<string>;
      getRecordChunk: (uid: string) => Promise<Buffer>;
      stop: (uid: string) => Promise<boolean>;
    },
  },
  spoon: {
    snsLogin: (url: string) => Promise<LogonUser>;
    setUser: (user: SetSpoonUserDto) => Promise<SpoonUserEntity>;
    getUser: () => Promise<SpoonUserEntity>;
    createLive: (prop: ApiLivesCreate.Request) => Promise<LiveCreated>;
    settingLive: (url: string) => Promise<void>;
    closeLive: () => Promise<void>;
    livePush: (chunk: Buffer) => Promise<void>;
  },
  config: {
    setUser: (user: SetUserDto) => Promise<UserEntity>;
    getUser: () => Promise<UserEntity>;
    setLiveSetting: (setting: SetLiveSettingDto) => Promise<LiveSettingEntity>;
    getLiveSetting: () => Promise<LiveSettingEntity>;
    setStreamSetting: (setting: SetStreamDto) => Promise<StreamSettingEntity>;
    getStreamSetting: () => Promise<StreamSettingEntity>;
    getTrackList: () => Promise<TrackEntity[]>;
    addTrack: (track: AddTrackDto) => Promise<TrackEntity>;
    setTrack: (track: SetTrackDto) => Promise<TrackEntity>;
    deleteTrack: (track: DeleteTrackDto) => Promise<void>;
    setRecord: (setting: SetRecordDto) => Promise<RecordSettingEntity>;
    getRecord: () => Promise<RecordSettingEntity>;
  },
  dialog: {
    open: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>;
    save: (options: SaveDialogOptions) => Promise<SaveDialogReturnValue>;
  },
  node: {
    fs: {
      readFile: typeof readFile,
      writeFile: typeof writeFile,
    },
    path: typeof path,
    electron: {
      ipcRenderer: typeof ipcRenderer,
    },
  },
}