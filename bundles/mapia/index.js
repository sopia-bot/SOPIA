/*
 * index.js
 * Created on Thu Dec 17 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */


sopia.var.mapia = {
	playing: false,
	dump: {},
    bgm: {},
};

sopia.var.last_msg_time = Date.now();
if ( typeof sopia.Rsend !== 'function' ) {
	sopia.Rsend = (msg, sndSrc, sndVolume) => {
		return new Promise(async (r) => {
			const now = Date.now();
			const delay = now - sopia.var.last_msg_time;
			if ( delay < sopia.drset.delay ) {
				setTimeout(() => {
					sopia.Rsend(msg).then(r);
				}, sopia.drset.delay - delay);
				return;
			}
			sopia.var.last_msg_time = Date.now();
			let d = 1;
			if ( sndSrc ) {
				playMusic(sndSrc, sndVolume);
				d = 3000;
			}
			setTimeout(() => {
				sopia.send(msg);
			}, d);
			return r();
		});
	};
}

if ( typeof sopia.helper !== 'function' ) {
	sopia.helper = async (msg) => {
		return await sopia.Rsend(msg);
	};
}

dumpEvents = () => {
    const keys = Object.keys(sopia._events);
    for ( const key of keys ) {
        const evt = sopia._events[key];

        if ( Array.isArray(evt) ) {
            sopia.var.mapia.dump[key] = [];
            evt.forEach((e) => {
                sopia.var.mapia.dump[key].push(e);
            });
        } else {
            sopia.var.mapia.dump[key] = evt;
        }
    }
};

removeEvents = () => {
    sopia._events = {};
};

restoreEvents = () => {
    const keys = Object.keys(sopia.var.mapia.dump);
    for ( const key of keys ) {
        const evt = sopia.var.mapia.dump[key];

        if ( Array.isArray(evt) ) {
            sopia._events[key] = [];
            evt.forEach((e) => {
                sopia._events[key].push(e);
            });
        } else {
            sopia._events[key] = evt;
        }
    }
    sopia.var.mapia.dump = {};
};
