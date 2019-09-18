sopia.include('./preload.js');
sopia.api = sopia.import('./api.js');

sopia.storage.load('messages',		'./storages/messages.json');
sopia.storage.load('permission',	'./storages/permission.json');
sopia.storage.load('admins',		'./storages/admins.json');
sopia.storage.load('personal',		'./storages/personal.json');
sopia.storage.load('blacklist',		'./storages/blacklist.json');
sopia.storage.load('join',			'./storages/join.json');
sopia.storage.load('like',			'./storages/like.json');
sopia.storage.load('shadowjoin',	'./storages/shadowjoin.json');
sopia.storage.load('present',		'./storages/present.json');

isCmd = (e) => {
	let msg = e.message;
	if ( msg.indexOf("!") === 0 ) {
		msg = msg.replace("!", ""); // ! 삭제
		e.message = msg;
		e.cmd = msg.split(' ')[0];
		return true;
	}
	return false;
};

isBlack = (tag = "") => {
	let b = sopia.storage.get('blacklist');
	if ( b.indexOf(tag) !== -1 ) {
		return true;
	}
	return false;
};

isAdmin = (author = "") => {
	let a = sopia.storage.get('admins');
	if ( a.indexOf(author.tag) !== -1 ) {
		return true;
	}

	if ( sopia.var.live && Array.isArray(sopia.var.live.manager_ids) ) {
		if ( sopia.var.live.manager_ids.includes(author.id) ) {
			return true;
		}
	}

	if ( sopia.var.live && sopia.var.live.author.id == author.id ) {
		return true;
	}

	return false;
};

runCmd = (cmd, e) => {
	let str = "";
	switch ( typeof cmd ) {
		case "string": {
			str = cmd;
		} break;
		case "function": {
			str = cmd(e);
		} break;
		case "object": {
			if ( Array.isArray(cmd) ) {
				let result = Math.floor(Math.random() * cmd.length);
				switch ( typeof cmd[result] ) {
					case "string": {
						str = cmd[result];
					} break;
					case "function": {
						str = cmd[result](e);
					}
				}
			}
		} break;
	}
	return str;
};

sopia.on('message', (e) => {
	if ( isBlack(e.author.tag) ) {
		return;
	}

	if ( isCmd(e) ) {
		//![command]
		let command = e.cmd;
		let sendStr = null;

		if ( isAdmin(e.author) ) {
			//permission messages
			let cmd = sopia.storage.get('permission.'+command);
			if ( cmd ) {
				sendStr = runCmd(cmd, e);
			}
		}

		if ( sendStr === null ) {
			//messages
			let cmd = sopia.storage.get('messages.'+command);
			if ( cmd ) {
				sendStr = runCmd(cmd, e);
			}
		}

		if ( sendStr === null ) {
			//personal
			let cmd = sopia.storage.get('personal.'+command);
			if ( cmd ) {
				sendStr = runCmd(cmd, e);
			}
		}

		if ( typeof sendStr === "string" ) {
			sopia.send(sendStr);
		}
	}
});

sopia.on('join', (e) => {
	let j = sopia.storage.get('join.default');
	let sendStr = runCmd(j, e);

	if ( typeof sendStr === "string" ) {
		sopia.send(sendStr);
	}
});

sopia.on('shadowjoin', (e) => {
	let s = sopia.storage.get('shadowjoin.default');
	let sendStr = runCmd(s, e);

	if ( typeof sendStr === "string" ) {
		sopia.send(sendStr);
	}
});

sopia.on('like', (e) => {
	let l = sopia.storage.get('like.default');
	let sendStr = runCmd(l, e);

	if ( typeof sendStr === "string" ) {
		sopia.send(sendStr);
	}
});

sopia.on('present', (e) => {
	let p = sopia.storage.get('present.default');
	let r = p[e.sticker];
	if ( !r ) {
		r = p['default'];
	}

	let sendStr = runCmd(r, e);

	if ( typeof sendStr === "string" ) {
		sopia.send(sendStr);
	}
});

sopia.on('all', (e) => {
	console.log(e);

	if ( e && e.data && e.data.live && e.data.live.created ) {
		sopia.var.created = new Date(e.data.live.created);
		sopia.var.live = e.data.live;
	}
});