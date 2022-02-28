let Q = [];
const pkg = require('./package.json');
const context = window['bctx'].get(pkg.name);
let manager_ids = [];

function isAdmin(author) {
	if ( manager_ids.includes(author.id) ) {
		return true;
	}

	return author.is_dj;
}

exports.live_message = function(evt, sock) {

	if ( !isAdmin(evt.data.user) ) {
		return;
	}

	const message = evt.update_component.message.value;
	let [ cmd, sec, ...content ] = message.split(' ');
	let name = '';
	switch ( cmd ) {
		case '!반복/추가':
			content = content.join(' ');
			name = 'loop-' + Date.now();
			const ms = parseInt(+sec * 1000);
			Q.push(name);
			context.itv.add(name, () => {
				sock.message(content.trim().replace(/\n/g, '\\n'));
			}, ms);
			sock.message(`앞으로 ${sec}초마다 반복해서 문장을 보냅니다.`);
			break;
		case '!반복/제거':
			name = Q.pop();
			if ( name ) {
				context.itv.abort(name);
				sock.message(`마지막 추가된 반복 작업을 제거했습니다.`);
			} else {
				sock.message(`제거할 반복 동작이 없습니다.`);
			}
			break;
	}
}

exports.live_update = function(evt, sock) {
	manager_ids = evt.data.live.manager_ids;
}