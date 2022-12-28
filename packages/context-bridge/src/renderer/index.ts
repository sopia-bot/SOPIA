import { SOPIAFunction } from '../type';
import crypto from 'crypto-js';

export function createSOPIAKey(key: string) {
	return crypto.SHA1(key).toString(crypto.enc.Hex);
}

const key = createSOPIAKey((window as any).version);
const getSOPIA = () => (window as any)[`_sopia-${key}`];

type BridgerFunction<Return, Args> = (s: SOPIAFunction) => (args: Args) => Return;
function createBridger<Return extends never|void>(fn: BridgerFunction<Return, []>): any;
function createBridger<Return extends never|void, Args extends any>(fn: BridgerFunction<Return, Args>) {
	fn(getSOPIA());
}


export const minimize = createBridger<void>((s) => s.app.minimize);
export const maximize = createBridger<void>((s) => s.app.maximize);
export const toggleMaximize = createBridger<void>((s) => s.app.toggleMaximize);
export const quit = createBridger<void>((s) => s.app.quit);