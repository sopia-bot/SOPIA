/*
 * processor.ts
 * Created on Wed Oct 14 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */
import { LiveEvent, User, SpoonClient, LiveSocket, Live } from '@sopia-bot/core';
import CfgLite from '@/plugins/cfg-lite-ipc';
import logger from '@/plugins/logger';
import Script from './script';
import { getAppPath } from '@/plugins/ipc-renderer';


const fs = window.require('fs');
const path = window.require('path');

const $path = (type: any, ...args: any) => {
	return path.resolve(getAppPath(type), ...args);
};

window.reloadScript = () => {
	Script.clear();
	Script.add($path('userData', 'sopia/'));
	const bundlePath = $path('userData', 'bundles');

	if ( !fs.existsSync(bundlePath) ) {
		fs.mkdirSync(bundlePath);
	}

	const bundles = fs.readdirSync(bundlePath);
	for ( const bundle of bundles ) {
		const target = path.join(bundlePath, bundle);
		const stat = fs.statSync(target);
		if ( stat.isDirectory() ) {
			Script.add(target);
		}
	}
};
window.addEventListener('DOMContentLoaded', () => {
	window.reloadScript();
});

const CMD_PATH = $path('userData', 'cmd.cfg');

declare global {
	interface Window {
		user: User;
		$spoon: any;
		$sopia: SpoonClient;
		reloadCmdCfg: () => void;
		reloadScript: () => void;
	}
}


let cfg: CfgLite = new CfgLite(CMD_PATH);
window.reloadCmdCfg = () => {
	cfg = new CfgLite(CMD_PATH);
};

const isAdmin = (live: Live, user: User|number) => {
	if ( typeof user === 'object' ) {
		if ( user.is_dj ) {
			return true;
		}
		user = user.id;
	}

	return live.manager_ids.includes(user);
};

const DEFAULT_CMD_PREFIX = '!';
const ckCmd = (cmd: any, msg: string) => {
	let prefix = window.appCfg.get('cmd.prefix');
	if ( !prefix ) {
		window.appCfg.set('cmd.prefix', DEFAULT_CMD_PREFIX);
		window.appCfg.save();
		logger.info('Prefix save [!]');
		prefix = DEFAULT_CMD_PREFIX;
	}

	const m = msg.split(/\s/);
	return m[0] === (prefix + cmd.command);
};

const ckCmdEvent = (evt: any, sock: LiveSocket) => {
	if ( evt.event !== LiveEvent.LIVE_JOIN &&
		 evt.event !== LiveEvent.LIVE_LIKE &&
		 evt.event !== LiveEvent.LIVE_PRESENT &&
		 evt.event !== LiveEvent.LIVE_MESSAGE ) {
		logger.debug('sopia', 'Event is not [JOIN, LIKE, PRESENT, MESSAGE]', evt.event);
		return false;
	}

	if ( evt.event === LiveEvent.LIVE_JOIN ||
		 evt.event === LiveEvent.LIVE_LIKE ||
		 evt.event === LiveEvent.LIVE_PRESENT ) {
		return isAdmin(sock.Live as Live, window.$sopia.logonUser);
	}

	return evt.event === LiveEvent.LIVE_MESSAGE;
};

const processor = async (evt: any, sock: LiveSocket) => {
	logger.debug('sopia', `receive event [${evt.event}]`, evt);

	setImmediate(() => {
		Script.run(evt, sock);
	});

	/* S: Cmd */
	if ( ckCmdEvent(evt, sock) ) {
		if ( window.appCfg.get('cmd.use') === true && fs.existsSync(CMD_PATH) ) {
			const comment = cfg.get(evt.event);
			const e = evt.data;

			if ( !comment ) {
				return;
			}

			let res = '';

			switch ( evt.event ) {
				case LiveEvent.LIVE_JOIN:
				case LiveEvent.LIVE_LIKE:
					res = comment;
					break;
				case LiveEvent.LIVE_PRESENT:
					let p = comment.find((c: any) => c.sticker === e.sticker);
					if ( !p ) {
						p = comment[0];
					}
					res = p.message;
					break;
				case LiveEvent.LIVE_MESSAGE:
					const m = comment.find((c: any) => ckCmd(c, evt.update_component.message.value));
					if ( m ) {
						if ( m.permit === 'manager' ) {
							if ( isAdmin(sock.Live as Live, e.user) ) {
								res = m.message;
							}
						} else {
							res = m.message;
						}
					}
					break;
			}

			res = res.replace(/\[\[name\]\]/g, (e.author || e.user).nickname)
				.replace(/\[\[tag\]\]/g, (e.author || e.user).tag)
				.replace(/\n/, '\\n');

			if ( evt.event === LiveEvent.LIVE_PRESENT ) {
				res = res.replace(/\[\[sticker\]\]/g, e.sticker)
					.replace(/\[\[combo\]\]/g, String(e.combo))
					.replace(/\[\[amount\]\]/g, String(e.amount))
					.replace(/\[\[count\]\]/g, String(e.amount * e.combo));
			}

			if ( res ) {
				logger.debug('cmd', `Send message [${res}]`);
				sock.message(res);
			}
		}
	}
	/* E: Cmd */
};

export default processor;
