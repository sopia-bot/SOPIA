const CfgLite = window.appCfg.__proto__.constructor;
const path = window.require('path');
const cfg = new CfgLite(path.join(__dirname, 'config.cfg'));

const Q = [];
let running = false;

const startSpeech = [
	(e) => '돌려 돌려 룰렛!',
	(e) => '과연 어떤 게 뽑힐까~?',
	(e) => '이게 좋아보여요. ˳⚆ɞ⚆˳',
	(e) => '나는 뭔지 알고 있지만 안 알려줄거에요. 😝',
	(e) => `${e.data.author.nickname}님은 뭘 갖고 싶어요?`,
	(e) => '헐. 이게 걸리네? 〣(ºΔº)〣',
];

const meanlessItems = [
	'평생 모든 편의점 무료 입장권',
	'디제이에게 스푼 쏠 기회',
	'"윤군님 멋있어요!"라고 말하기',
	'마음속으로 노래부르기 벌칙',
	'모든 백화점 무제한 아이쇼핑 쿠폰',
];

const whackSpeech = [
	async (e, sock) => {
		sock.message(`헐 ${e.data.author.nickname}님. 중대발표가 있어요.`);
		await sleep(2000);
		sock.message(`이번에 당첨되신 항목은 무려...!`);
		await sleep(2000);
		sock.message('꽝이에요. 뭐지? 버근가?  ¯＼_(ツ)_/¯ ');
		await sleep(2000);
		sock.message('당첨될 때 까지 ㄱㄱ!');
	},
	async (e, sock) => {
		sock.message('축하합니다!');
		await sleep(2000);
		sock.message(`${e.data.author.nickname}님은 [${random(meanlessItems)}]에 당첨되셨습니다!!!`);
		await sleep(2000);
		sock.message('꽝이란 소리에요. 뭐라도 당첨된 것 처럼 보이는게 좋잖아요. ꉂ (๑¯ਊ¯)σ ');
	},
	async (e, sock) => {
		sock.message('ㅋㅋㅋ');
		await sleep(1000);
		sock.message('ㅋㅋㅋㅋㅋㅋ');
		await sleep(1000);
		sock.message('ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ');
		await sleep(1000);
		sock.message('꽝ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ');
	},
	async (e, sock) => {
		sock.message('저런... 꽝이네요.');
		await sleep(2000);
		sock.message('자, 울지 마시고 한 번 더!');
		await sleep(2000);
		sock.message(`${cfg.get('options.min')}스푼밖에 안 해요~.`);
		await sleep(2000);
		sock.message(`할 수 있다. ${e.data.author.nickname}님 파이팅!  ꒰◍ॢ•ᴗ•◍ॢ꒱ `);
	},
	async (e, sock) => {
		const reversList = [];
		cfg.get('list').forEach((l, idx) => {
			reversList[idx] = {
				percentage: 100 - l.percentage,
				value: l.value,
			};
		});
		let pick;
		do {
			pick = randomOnPickByPer(reversList);
		} while( !pick );
		sock.message('와......');
		await sleep(2000);
		sock.message(`${e.data.author.nickname}님은......`);
		await sleep(2000);
		sock.message(`[${pick.value}] 당첨!`);
		await sleep(2000);
		sock.message('이라는 내용의 소설 추천받아요! 사실 꽝입니당~  ༽΄◞ิ౪◟ิ‵༼ ');
	},
];

const winSpeech = [
	async (e, sock) => {
		sock.message(`헐 ${e.data.author.nickname}님. 중대발표가 있어요.`);
		await sleep(2000);
		sock.message(`이번에 당첨되신 항목은 무려...!`);
		await sleep(2000);
		sock.message(`[${e.item.value}] 에요!`);
	},
	async (e, sock) => {
		sock.message('축하합니다!');
		await sleep(2000);
		sock.message(`${e.data.author.nickname}님은 [${e.item.value}]에 당첨되셨습니다!!!`);
	},
	async (e, sock) => {
		sock.message('ㅋㅋㅋ');
		await sleep(1000);
		sock.message('ㅋㅋㅋㅋㅋㅋ');
		await sleep(1000);
		sock.message('ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ');
		await sleep(1000);
		sock.message(`와 이게 [${e.item.value}] 가 당첨되네.`);
	},
	async (e, sock) => {
		sock.message('와......');
		await sleep(2000);
		sock.message(`${e.data.author.nickname}님은......`);
		await sleep(2000);
		sock.message(`무려 [${e.item.value}] 당첨!`);
		await sleep(2000);
		sock.message(`이게 당첨되니 개노잼이네 ㄹㅇ`);
	},
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (num=0, min=0) => Math.floor(Math.random() * (num)) + min;
const random = (items) => items[rand(items.length)];

function randomOnPickByPer(list = []) {
	const percentage = rand(100);
	let pickItems = [];
	let pickItem;
	let cumulative = 0;

	list = list.sort((a, b) => a.percentage - b.percentage);

	for ( const item of list ) {
		cumulative = item.percentage;
		if ( percentage <= cumulative ) {
			pickItems = list.filter(i => i.percentage === item.percentage);
			break;
		}
	}

	if ( pickItems.length > 1 ) {
		const pick = rand(pickItems.length);
		pickItem = pickItems[pick];
	} else {
		pickItem = pickItems[0];
	}

	return pickItem;
}

async function processor() {
	if ( running ) {
		return false;
	}

	running = true;

	const e = Q.shift();
	const sock = e.sock;
	if ( cfg.get('options.useEffect') ) {
		// TODO: use effect
	}

	const item = randomOnPickByPer(cfg.get('list'));
	if ( item ) {
		e.item = item;
		await random(winSpeech)(e, sock);
	} else {
		await random(whackSpeech)(e, sock);
	}

	running = false;
	if ( Q.length ) {
		await sleep(2000);
		await processor();
	}
}

exports.live_present = (evt, sock) => {
	if ( !cfg.get('enable') ) {
		return false;
	}

	const num = evt.data.amount * evt.data.combo;
	if ( num >= cfg.get('options.min') ) {
		evt.sock = sock;
		Q.push(evt);
		if ( running === false ) {
			processor();
		}
	}
}
