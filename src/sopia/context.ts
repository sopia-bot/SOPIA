/* tslint:disable:max-classes-per-file */

import { EventEmitter } from '@sopia-bot/core';

interface RecordItem {
	func: () => void;
	ms: number;
	key: string;
	isLoop: boolean;
	nextTime: number;
}


const worksheet: Record<string, RecordItem> = {};
function worker() {
	for ( const [key, val] of Object.entries(worksheet) ) {
		const now = Date.now();
		if ( now >= val.nextTime ) {
			setImmediate(val.func);
			if ( val.isLoop ) {
				val.nextTime = now + val.ms;
			} else {
				delete worksheet[key];
			}
		}
	}
	setImmediate(worker);
}


// 개발모드로 실행시 핫리로드로 인한 여러번 겹쳐 실행됨을 방지
let runner = 0;
if ( runner === 0 )  {
	runner += 1;
	setImmediate(worker);
}



export class Timer {

	protected isLoop = false;

	public add(key: string, func: () => void, ms: number) {
		if ( worksheet[key] ) {
			return 0 as any;
		}

		worksheet[key] = {
			key,
			func,
			ms,
			isLoop: this.isLoop,
			nextTime: Date.now() + ms,
		};
	}

	public abort(key: string) {
		if ( worksheet[key] ) {
			delete worksheet[key];
		}
	}

	public clear() {
		const rs = Object.values(worksheet);
		for ( const r of rs ) {
			if ( r.isLoop === this.isLoop ) {
				this.abort(r.key);
			}
		}
	}

}

export class Timeout extends Timer {

}

export class Interval extends Timer {

	constructor() {
		super();
		this.isLoop = true;
	}

}

export default class Context extends EventEmitter {

	public itv: Interval = new Interval();
	public timeout: Timeout = new Timeout();

	constructor(private name: string) {
		super();
	}

}
