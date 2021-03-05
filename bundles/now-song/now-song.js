var { getMelonCaption } = sopia.require(sopia.config.bundle['now-song']);
var qs = sopia.require('querystring');

var komca = localStorage.getItem('komca');
if ( komca != '' ) {
	sopia.komca = JSON.parse(komca);
} else {
	sopia.komca = {};
}

sopia.lastSong = '';

var getNowSongInfo = () => {
	const caption = getMelonCaption().trim();
	if ( caption === '' ) {
		return;
	}

	const delMelonCaption = caption.replace(/ - melon$/i, '').trim();
	const [ title, singer ] = delMelonCaption.split(/ - /);
	return { title, singer };
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

var SONG_ITV_TIME = 3 * 1000; // 3 sec
var itvSongCallback = async () => {
	const song = getNowSongInfo();
	if ( !song ) {
		return;
	}

	if ( song.lastSong === song.title ) {
		return;
	}

	// 곡이 변경될 때마다 현재 곡 정보를 출력하고 싶으면
	// 아래 false 를 true로 변경하기만 하면 됨.
	if ( false ) {
		sopia.send(`🔊현재 곡 정보🎶\n${song.title} - ${song.singer}`);
	}

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
			S_HNAB_GBN: 'I',
			S_SECT_CD: '',
			S_PROD_TTL: title,
			S_PROD_TTL_GB: 3,
			S_DISCTITLE_NM: '',
			S_SINA_NM: singer,
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
	const album = result.querySelector('dd.metadata').children[2].querySelector('span').innerText;

	const komcaData = spoon.UserKomcaSong.deserize({ title, singer, album, code });

	await $sopia.userManager.userKomca([ komcaData ]);
};

sopia.itv.add('komca', itvSongCallback, SONG_ITV_TIME);
