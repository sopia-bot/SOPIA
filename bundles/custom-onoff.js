const evtKeys = Object.keys(sopia._events);


sopia.var.onoffFunc = {
	'join': () => {},
	'shadowjoin': () => {},
	'like': () => {},
	'present': () => {}
};

sopia.var.onoff = {
	'join': false,
	'shadowjoin': false,
	'like': false,
	'present': false
};
sopia.var.onoffKey = {
	'입장': 'join',
	'좋아요': 'like',
	'유령': 'shadowjoin',
	'선물': 'present',
};

evtKeys.forEach((k) => {
	// 함수들을 저장해서 on off 할 때 사용하면 됨.
	if ( [ "join", "like", "shadowjoin", "present" ].includes(k) ) {
		let func = sopia._events[k];
		if ( Array.isArray(func) ) {
			func = func[0];
		}

		sopia.var.onoffFunc[k] = func;
	}
});

onoffHelp = function() {
	let str = "![행동] on|off\n";
	str += "행동\n";

	const keys = Object.keys(sopia.var.onoffKey);
	keys.forEach((k) => {
		str += `	- ${k}\n`;
	});
	sopia.send(str);
};

sopia.on('message', (e) => {
	if ( e.isCmd || isCmd(e) ) {
		//permission messages
		if ( isAdmin(e.author) ) {
			//![command]
			let command = e.cmd;
			let sendStr = null;

			let onoff = e.message.split(' ');
			if ( onoff.length <= 1 ) {
				onoffHelp();
				return;
			}

			onoff = onoff[1];
			if ( onoff !== "on" && onoff !== "off" ) {
			}

			const key = sopia.var.onoffKey[command];
			if ( onoff === "on" ) {
				if ( sopia.var.onoff === true ) {
					sopia.send("이미 on 상태입니다.");
					return;
				}

				sopia.var.onoff[key] = true;
				sopia.prependListener(key, sopia.var.onoffFunc[key]);
			} else if ( onoff === "off" ) {
				if ( sopia.var.onoff === false ) {
					sopia.send("이미 off 상태입니다.");
					return;
				}

				sopia.var.onoff[key] = false;
				sopia.removeListener(key, sopia.var.onoffFunc[key]);
			} else {
				onoffHelp();
				return;
			}

			sopia.send(`성공. 앞으로 ${command} 에 대한 반응을 ${onoff === 'on' ? '합니다.' : '하지 않습니다.'}`);
		}
	}
});
