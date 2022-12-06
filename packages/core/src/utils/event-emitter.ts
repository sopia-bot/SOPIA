/*
 * event-emitter.ts
 * Created on Fri Apr 30 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

export interface EventObject {
	once: boolean;
	func: (data?: any[]) => void;
}

export interface EventList {
	[key: string]: EventObject[];
}

export class EventEmitter {
	private _events: EventList = {};

	constructor() {
		// empty
	}

	private pushEvent(key: string, evt: EventObject): void {
		if ( !this._events[key] ) {
			this._events[key] = [];
		}

		this._events[key].push(evt);
	}

	private unshiftEvent(key: string, evt: EventObject): void {
		if ( !this._events[key] ) {
			this._events[key] = [];
		}

		this._events[key].unshift(evt);
	}

	on (key: string, func: (data?: any) => void): void {
		this.pushEvent(
			key,
			{
				once: false,
				func,
			},
		);
	}

	once (key: string, func: (data?: any) => void): void {
		this.pushEvent(
			key,
			{
				once: true,
				func,
			},
		);
	}

	addEventListener(key: string, func: (data?: any) => void): void {
		this.on(key, func);
	}

	emit (key: string, ...argv: any[]): void {
		if ( this._events[key] ) {
			const once: number[] = [];
			this._events[key].forEach((evt) => {
				evt.func(...argv);
			});

			this._events[key] = this._events[key].filter((obj: EventObject) => !obj.once);
		}
	}

	eventNames(): string[] {
		return Object.keys(this._events);
	}

	listenerCount(key: string): number {
		return this._events[key]?.length || 0;
	}

	prependListener(key: string, func: (data?: any[]) => void): void {
		this.unshiftEvent(
			key,
			{
				once: false,
				func,
			},
		);
	}

	prependOnceListener(key: string, func: (data?: any[]) => void): void {
		this.unshiftEvent(
			key,
			{
				once: true,
				func,
			},
		);
	}

	removeAllListeners(key: string): void {
		this._events[key] = [];
	}

	removeListener(key: string, func: (data?: any[]) => void): (EventObject|void) {
		if ( this._events[key] ) {
			const idx = this._events[key].findIndex(evt => evt.func === func);
			return this._events[key].splice(idx, 1)[0];
		}
	}

	off(key: string, func: (data?: any[]) => void): void {
		this.removeListener(key, func);
	}

	destoryAllListener(): void {
		const keys = Object.keys(this._events);
		keys.forEach((key) => {
			this.removeAllListeners(key);
		});
	}
}
