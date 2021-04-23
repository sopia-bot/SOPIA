var { getNowSong } = sopia.require(getPath(sopia.config.bundle['now-song'] + '/get-now-song.node'));
if ( typeof qs === 'undefined' ) {
	window.qs = sopia.require('querystring');
}

var komca = localStorage.getItem('komca');
if ( komca ) {
	sopia.komca = JSON.parse(komca);
} else {
	sopia.komca = {};
}

sopia.lastSong = '';

window.getNowSongInfo = () => {
	const caption = getNowSong().trim();
	if ( caption === '' ) {
		return;
	}

	if ( caption.includes('ActiveMovie Window') ) {
		sopia.send('멜론 플레이어를 한 번 클릭해 주세요.');
		return;
	}

	const delMelonCaption = caption.replace(/ - melon$/i, '').trim();
	try {
		let [ song, title, singer ] = delMelonCaption.match(/(.*?) - (.*)/);
		title = title.replace(/\(.*?\)/g, '');
		singer = singer.replace(/\(.*?\)/g, '').replace(/[,&].*/, '').trim();
		return { title, singer };
	} catch(err) {
		console.error(err);
	}
}

sopia.on('message', (e) => {
	if ( e.isCmd || isCmd(e) ) {
		if ( e.cmd === "현재곡" ) {
			const song = getNowSongInfo();

			if ( !song ) {
				sopia.send("현재 곡 정보를 가져올 수 없습니다.");
				return;
			}

			sopia.send(`🔊현재 곡 정보🎶\n${song.title} - ${song.singer}`);
		}
	}
});

var searchKomcaData = async (song, hnab = 'I') => {
	const { data } = await axios({
		url: 'https://www.komca.or.kr/srch2/srch_01.jsp',
		method: 'post',
		data: qs.stringify({
			SYSID: 'PATHFINDER',
			MENUID: '',
			EVENTID: '',
			S_PAGENUMBER: 1,
			S_PROD_CD: '',
			S_RIGHTPRES_GB: 1,
			S_RIGHTPRES_CD: '',
			rows: 10,
			input_idx: '',
			input_name: '',
			input_name2: '',
			pub_val: '',
			S_LIB_YN: 'N',
			S_HANMB_NM: '',
			S_HNAB_GBN: hnab,
			S_SECT_CD: '',
			S_PROD_TTL: song.title,
			S_PROD_TTL_GB: 3,
			S_DISCTITLE_NM: '',
			S_SINA_NM: song.singer,
			S_START_DAY: '',
			S_END_DAY: '',
			S_RIGHTPRES_NM: '',
			S_PROD_TTL2: '',
			S_PROD_TTL_GB2: 3,
			S_ROWS: 10,
		}),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	});

	const html = data.replace(/[\r\n]/g, '');
	const content = html.match(/<div[^>]*class="result_list"[^>]*>(.*?)<\/div>/);
	const body = document.createElement('div');
	body.innerHTML = content;
	const result = body.querySelector('.result_article');
	
	const code = result.querySelector('dt.tit2').innerText.replace(/^.*- /, '');
	let album = result.querySelector('dd.metadata');
	if ( album.childElementCount >= 3 ) {
		album = album.children[2].querySelector('span').innerText;
	} else {
		album = '';
	}

	return { title: song.title, singer: song.singer, code, album };
};

var SONG_ITV_TIME = 5 * 1000; // 5 sec
var itvSongCallback = async () => {
	const song = getNowSongInfo();
	if ( !song ) {
		return;
	}

	if ( sopia.lastSong === song.title ) {
		return;
	}
	sopia.lastSong = song.title;

	sopia.debug('Change new song.', song);

	// 곡이 변경될 때마다 현재 곡 정보를 출력하고 싶으면
	// 아래 false 를 true로 변경하기만 하면 됨.
	if ( false ) {
		sopia.send(`🔊현재 곡 정보🎶\n${song.title} - ${song.singer}`);
	}

	let k;
	try {
		k = await searchKomcaData(song);
	} catch(err) {
		try {
			k = await searchKomcaData(song, 'O');
		} catch(err) {
			try {
			song.title = song.title.replace(/\s/g, '');
			k = await searchKomcaData(song);
			} catch(err) {
				sopia.send(`국내외 저작권 정보를 검색할 수 없는 곡입니다.\n제목: ${song.title}, 가수: ${song.singer}`);
				return;
			}
		}
	}

	if ( sopia.komca[k.code] ) {
		sopia.debug('Already report komca song', song);
		return;
	}
	sopia.komca[k.code] = k;
	localStorage.setItem('komca', JSON.stringify(sopia.komca));

	const komcaData = spoon.UserKomcaSong.deserialize(k);

	sopia.debug('Komca report', komcaData);
	await $sopia.userManager.userKomca([ komcaData ]);
};

sopia.itv.add('komca', itvSongCallback, SONG_ITV_TIME);
