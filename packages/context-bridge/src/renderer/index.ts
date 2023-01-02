import { SOPIAFunction } from '../type';
import crypto from 'crypto-js';
import { LogonUser } from '@sopia-bot/core';

export function createSOPIAKey(key: string) {
	return crypto.SHA1(key).toString(crypto.enc.Hex);
}

const key = createSOPIAKey((window as any).version);
const getSOPIA = () => (window as any)[`_sopia-${key}`];

type BridgerFunction<Return, Argument> = (s: SOPIAFunction) => (args: Argument) => Return;
function createBridger<Return extends any>(fn: BridgerFunction<Return, []>): any;
function createBridger<Return extends any, Argument extends any>(fn: BridgerFunction<Return, Argument>): any;
function createBridger(fn: any) {
	return fn(getSOPIA());
}


export const minimize = createBridger<void>((s) => s.app.minimize);
export const maximize = createBridger<void>((s) => s.app.maximize);
export const toggleMaximize = createBridger<void>((s) => s.app.toggleMaximize);
export const quit = createBridger<void>((s) => s.app.quit);

export const snsLoginOpen = createBridger<Promise<LogonUser>, string>((s) => s.spoon.snsLogin);