import { SOPIAFunction } from '../type';
import crypto from 'crypto-js';
import { ApiLivesCreate, LogonUser } from '@sopia-bot/core';
import { UserEntity } from '../entities/user.entity';
import { SetUserDto } from '../dto/user.dto';
import { SetSpoonUserDto } from '../dto/spoon/user.dto';
import { SpoonUserEntity } from '../entities/spoon/user.entity';
import { LiveSettingEntity } from '../entities/live-setting.entity';
import { SetLiveSettingDto, SetStreamDto } from '../dto';
import { OpenDialogOptions, OpenDialogReturnValue, SaveDialogReturnValue, SaveDialogOptions } from 'electron';
import { StreamSettingEntity } from '../entities';

export function createSOPIAKey(key: string) {
	return crypto.SHA1(key).toString(crypto.enc.Hex);
}

const key = createSOPIAKey((window as any).version);
const getSOPIA = () => (window as any)[`_sopia-${key}`];

type BridgerFunction<Return, Argument extends Array<any>> = (s: SOPIAFunction) => (...args: Argument) => Return;
function createBridger<Return extends any>(fn: BridgerFunction<Return, []>): ReturnType<BridgerFunction<Return, []>>;
function createBridger<Return extends any, Argument extends any[]>(fn: BridgerFunction<Return, Argument>): ReturnType<BridgerFunction<Return, Argument>>;
function createBridger(fn: any) {
	return fn(getSOPIA());
}


export const minimize = createBridger<void>((s) => s.app.minimize);
export const maximize = createBridger<void>((s) => s.app.maximize);
export const toggleMaximize = createBridger<void>((s) => s.app.toggleMaximize);
export const quit = createBridger<void>((s) => s.app.quit);

export const snsLoginOpen = createBridger<Promise<LogonUser>, [string]>((s) => s.spoon.snsLogin);
export const setSpoonUserInfo = createBridger<Promise<SpoonUserEntity>, [SetSpoonUserDto]>((s) => s.spoon.setUser);
export const getSpoonUserInfo = createBridger<Promise<SpoonUserEntity>>((s) => s.spoon.getUser);
export const createLive = createBridger<Promise<ApiLivesCreate.Response>, [ApiLivesCreate.Request]>((s) => s.spoon.createLive);
export const pushLiveChunk = createBridger<Promise<void>, [Buffer]>((s) => s.spoon.livePush);

export const setUserInfo = createBridger<Promise<UserEntity>, [SetUserDto]>((s) => s.config.setUser);
export const getUserInfo = createBridger<Promise<UserEntity>>((s) => s.config.getUser);
export const setLiveSetting = createBridger<Promise<LiveSettingEntity>, [SetLiveSettingDto]>((s) => s.config.setLiveSetting);
export const getLiveSetting = createBridger<Promise<LiveSettingEntity>>((s) => s.config.getLiveSetting);
export const setStreamSetting = createBridger<Promise<StreamSettingEntity>, [SetStreamDto]>((s) => s.config.setStreamSetting);
export const getStreamSetting = createBridger<Promise<StreamSettingEntity>>((s) => s.config.getStreamSetting);

export const showOpenDialog = createBridger<Promise<OpenDialogReturnValue>, [OpenDialogOptions]>((s) => s.dialog.open);
export const showSaveDialog = createBridger<Promise<SaveDialogReturnValue>, [SaveDialogOptions]>((s) => s.dialog.save);

export const getFileSystem = createBridger<SOPIAFunction['node']['fs']>((s) => () => s.node.fs as any);
export const getNodePath = createBridger<SOPIAFunction['node']['path']>((s) => () => s.node.path);