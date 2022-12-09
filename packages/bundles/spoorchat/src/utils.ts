import CfgLite from "cfg-lite";

/*
 * utils.js
 * Created on Fri Feb 11 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
const path = window.require('path');
const fs = window.require('fs');

export const charWrapper =
	(str: string) => str.toString()
		.replace(/\\/g, '')
		.replace(/\./g, '')
		.replace(/\+/g, '+')
		.replace(/\n/g, ' ')
		.replace(/\ /, '');

export function checkPresent(cfg: CfgLite, data: any) {
	if ( cfg.get('options.type') === 'select' ) {
		const present = cfg.get('options.present');
		return present.name === data.sticker;
	}

	const num = data.amount * data.combo;
	return num >= cfg.get('options.min');
}

export function getEffectPath(item: any): string {
	let p = path.join(__dirname, 'sounds', item.sticker.replace(/_\w{2,}_/, '_') + '.mp3');
	if ( item.combo >= 10 ) {
		let tmpP = path.join(__dirname, 'sounds', item.sticker.replace(/_\w{2,}_/, '_') + '_long.mp3');
		if ( fs.existsSync(tmpP) ) {
			p = tmpP;
		}
	}

	if ( !fs.existsSync(p) ) {
		p = path.join(__dirname, 'sounds', 'default.mp3');
	}
	return p;
}