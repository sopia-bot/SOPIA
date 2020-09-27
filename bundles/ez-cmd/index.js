/*
 * index.js
 * Created on Thu Sep 24 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */

 if ( !sopia.ezCmdLoaded ) {
    sopia.ezCmdLoaded = true;
    [ "join", "like", "shadowjoin", "present" ].forEach((k) => {
        // 기본 이벤트 함수 날림
		let func = sopia._events[k];
		if ( Array.isArray(func) ) {
			func = func[0];
		}

		sopia.removeListener(k, func);
    });
}

sopia.on('join', (e) => {
	if ( typeof window.EzJoin === 'object' ) {
		if ( window.EzJoin.msg.trim() ) {
			sopia.send(
				window.EzJoin.msg
					.trim()
					.replace(/\[\[name\]\]/g, e.author.nickname)
					.replace(/\[\[tag\]\]/g, e.author.tag)
			);
		}
	}
});

sopia.on('like', (e) => {
	if ( typeof window.EzLike === 'object' ) {
		if ( window.EzLike.msg.trim() ) {
			sopia.send(window.EzLike.msg
				.trim()
				.replace(/\[\[name\]\]/g, e.author.nickname)
				.replace(/\[\[tag\]\]/g, e.author.tag)
			);
		}
	}
});

sopia.on('present', (e) => {
	if ( typeof window.EzPresent === 'object' ) {
		if ( window.EzPresent[e.sticker].trim() ) {
			sopia.send(
				window.EzPresent[e.sticker]
					.trim()
					.replace(/\[\[name\]\]/g, e.author.nickname)
					.replace(/\[\[tag\]\]/g, e.author.tag)
					.replace(/\[\[combo\]\]/g, e.combo)
					.replace(/\[\[amount\]\]/g, e.amount)
					.replace(/\[\[count\]\]/g, e.combo * e.amount)
					.replace(/\[\[sticker\]\]/g, e.sticker)
			);
		} else if ( window.EzPresent['default'].trim() ) {
			sopia.send(
				window.EzPresent[e.sticker]
					.trim()
					.replace(/\[\[name\]\]/g, e.author.nickname)
					.replace(/\[\[tag\]\]/g, e.author.tag)
					.replace(/\[\[combo\]\]/g, e.combo)
					.replace(/\[\[amount\]\]/g, e.amount)
					.replace(/\[\[count\]\]/g, e.combo * e.amount)
					.replace(/\[\[sticker\]\]/g, e.sticker)
			);
		}
	}
});

sopia.on('message', (e) => {
	if ( e.isCmd || isCmd(e) ) {
		const idx = window.EzMessage.findIndex((m) => m.cmd === e.cmd);
		if ( idx >= 0 ) {
			const msg = window.EzMessage[idx];
			if ( msg.permission ) {
				if ( isAdmin(e.author) ) {
					sopia.send(
						msg.msg
							.replace(/\[\[name\]\]/g, e.author.nickname)
							.replace(/\[\[tag\]\]/g, e.author.tag)
					);
				}
			} else {
				sopia.send(
					msg.msg
						.replace(/\[\[name\]\]/g, e.author.nickname)
						.replace(/\[\[tag\]\]/g, e.author.tag)
				);
			}
		}
	}
});