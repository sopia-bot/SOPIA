const path = window.require('path');

const { getNowSong } = window.require(path.join(__dirname, './song'));

let lastSong = '';

window.getNowSongInfo = (sock) => {
	const caption = getNowSong().trim();
	if ( caption === '' ) {
		return;
	}

	if ( caption.includes('ActiveMovie Window') ) {
		sock.message('멜론 플레이어를 한 번 클릭해 주세요.');
		return;
	}

	const delMelonCaption = caption.replace(/ - melon$/i, '').trim();
	try {
		let [ song, title, singer ] = delMelonCaption.match(/(.*?) - (.*)/);
		return { title, singer };
	} catch(err) {
		console.error(err);
	}
}

exports.live_message = function(evt, sock) {
	const message = evt.update_component.message.value;
	let [ cmd ] = message.split(' ');
	let name = '';

	if ( cmd === '!현재곡' ) {
		const song = getNowSongInfo(sock);

		if ( !song ) {
			sock.message("현재 곡 정보를 가져올 수 없습니다.");
			return;
		}

		sock.message(`🔊현재 곡 정보🎶\\n${song.title} - ${song.singer}`);
	}
};