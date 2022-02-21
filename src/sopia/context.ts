/* tslint:disable:max-classes-per-file */

class Interval {
	private itv: any = {};

	public add(name: string, func: () => void, ms: number) {
		this.itv[name] = {
			name,
			func,
			ms,
			id: setInterval(func, ms),
		};
	}

	public abort(name: string) {
		if ( this.itv[name] ) {
			clearInterval(this.itv[name].id);
			delete this.itv[name];
		}
	}

	public clear() {
		for ( const key of Object.keys(this.itv) ) {
			this.abort(key);
		}
	}
}

class Timeout {
	private tout: any = {};

	public add(name: string, func: () => void, ms: number) {
		this.tout[name] = {
			name,
			func,
			ms,
			id: setTimeout(() => {
				this.abort(name);
				func();
			}, ms),
		};
	}

	public abort(name: string) {
		if ( this.tout[name] ) {
			clearTimeout(this.tout[name].id);
			delete this.tout[name];
		}
	}

	public clear() {
		for ( const key of Object.keys(this.tout) ) {
			this.abort(key);
		}
	}
}

class Context {
	public itv = new Interval();
	public timeout = new Timeout();

	constructor(public name: string) {

	}

	public clear() {
		this.itv.clear();
		this.timeout.clear();
	}
}

const contexts: Record<string, Context> = {};

(window as any)['bctx'] = {
	get(name: string) {
		return contexts[name];
	},
	new(name: string) {
		if ( !contexts[name] ) {
			return contexts[name] = new Context(name);
		}
	},
	destroy(name: string) {
		if ( contexts[name] ) {
			contexts[name].clear();
			delete contexts[name];
		}
	},
};
