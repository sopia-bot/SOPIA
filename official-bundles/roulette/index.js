const CfgLite = window.appCfg.__proto__.constructor;
const path = window.require('path');
const { v4:uuid } = window.require('uuid');
const cfg = new CfgLite(path.join(__dirname, 'config.cfg'));

console.log(path.join(__dirname, 'config.cfg'));
const Q = [];
const tmpQ = [];
const ctx = window.bctx.get('roulette');
let running = false;

let hisStr = '';
const history = (str) => ctx.ipc.emit('history:set', hisStr += str + '\n');
const copy = (obj) => JSON.parse(JSON.stringify(obj));

const startSpeech = [
	(e) => '돌려 돌려 룰렛!',
	(e) => '과연 어떤 게 뽑힐까~?',
	(e) => '이게 좋아보여요. ˳⚆ɞ⚆˳',
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
		sock.message('꽝이에요. 뭐지? 버근가?  ¯＼_(ツ)_/¯ ');
		await sleep(2000);
		sock.message('당첨될 때 까지 ㄱㄱ!');
	},
	async (e, sock) => {
		sock.message('축하합니다!');
		await sleep(2000);
		sock.message(`${e.data.author.nickname}님은 [${random(meanlessItems)}]에 당첨되셨습니다!!!`);
		await sleep(2000);
		sock.message('꽝이란 소리에요. 뭐라도 당첨된 것 처럼 보이는게 좋잖아요. ꉂ (๑¯ਊ¯)σ ');
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
		sock.message(`할 수 있다. ${e.data.author.nickname}님 파이팅!  ꒰◍ॢ•ᴗ•◍ॢ꒱ `);
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
		sock.message('이라는 내용의 소설 추천받아요! 사실 꽝입니당~  ༽΄◞ิ౪◟ิ‵༼ ');
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

function sumArray(arr) {
	let s = 0;
	arr.forEach((a) => s += a);
	return s;
}

//function randomOnPickByPer(list = []) {
//	let percentage = Math.random();
//	let pickItems = [];
//	let pickItem;
//	let cumulative = 0;
//	let sum = 0;
//	let sumList = {};


//	list.forEach((l) => {
//		if ( !sumList[l.percentage] ) {
//			sumList[l.percentage] = [];
//		}
//		sumList[l.percentage].push(l);
//	});
//	sum = sumArray(Object.keys(sumList).map((p) => +p)) / 100;
//	//percentage *= sum;

//	list = list.sort((a, b) => a.percentage - b.percentage);
//	if ( !list.find((l) => l.value === '꽝') ) {
//		let p = 0;
//		list.push({
//			value: '꽝',
//			percentage: 100 - (sum * 100),
//		});
//	}

//	for ( const [per, value] of Object.entries(sumList) ) {
//		cumulative += (+per / 100);
//		if ( percentage <= cumulative ) {
//			pickItems = value;
//			break;
//		}
//	}

//	if ( pickItems.length > 1 ) {
//		const pick = rand(pickItems.length);
//		pickItem = pickItems[pick];
//	} else {
//		pickItem = pickItems[0];
//	}

//	return pickItem;
//}

function randomOnPickByPer(list = []) {
	const allItem = [];

	list.forEach((item) => {
		const count = item.percentage.toFixed(2) * 100;
		for ( let i = 0 ;i < count;i++ ) {
			allItem.push(item);
		}
	});

	const wrongCount = 10000 - allItem.length;

	if ( wrongCount ) {
		for ( let i = 0;i < wrongCount;i++ ) {
			allItem.push({ value: '꽝' });
		}
	}

	return random(allItem);
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
	window.logger.debug('roulette', `룰렛에서 당첨된 아이템`, item);
	if ( item && item.value !== '꽝' ) {
		e.item = item;
		cfg.get('options.simple')
		? sock.message(`${e.data.author.nickname}님은 룰렛 [${e.item.value}]에 당첨되셨습니다.`)
		: await random(winSpeech)(e, sock);
		history(`${e.data.author.nickname}(${e.data.author.tag}): 룰렛 결과 ${item.value} 당첨 - ${e.uuid}`);
	} else {
		cfg.get('options.simple')
		? sock.message(`${e.data.author.nickname}님은 아쉽게도 룰렛 꽝입니다.`)
		: await random(whackSpeech)(e, sock);
		history(`${e.data.author.nickname}(${e.data.author.tag}): 룰렛 결과 꽝 - ${e.uuid}`);
	}


	running = false;
	if ( cfg.get('options.auto') && tmpQ.length ) {
		Q.push(tmpQ.shift());
	}
	if ( Q.length ) {
		await sleep(2000);
		await processor();
	}
}

function checkPresent(data) {
	if ( cfg.get('options.type') === 'select' ) {
		const present = cfg.get('options.present');
		return present.name === data.sticker;
	}

	const num = data.amount * data.combo;
	return num >= cfg.get('options.min');
}

exports.live_present = (evt, sock) => {
	if ( !cfg.get('enable') ) {
		return false;
	}

	if ( checkPresent(evt.data) ) {
		let chance = 1;
		let uuids = [];
		switch (cfg.get('options.rule')) {
			case 'combo':
				chance = evt.data.combo;
				for ( let i=0;i<chance;i++ ) {
					const e = copy(evt);
					e.sock = sock;
					e.uuid = uuid();
					uuids.push(e.uuid);
					tmpQ.push(e);
				}
				break;
			case 'division':
				const num = evt.data.amount * evt.data.combo;
				const min = cfg.get('options.min');
				chance = Math.floor(num / min);
				for ( let i=0;i<chance;i++) {
					const e = copy(evt);
					e.sock = sock;
					e.uuid = uuid();
					uuids.push(e.uuid);
					tmpQ.push(e);
				}
				break;
			default:
				evt.uuid = uuid();
				evt.sock = sock;
				uuids.push(evt.uuid);
				tmpQ.push(evt);
		}
		history(`${evt.data.author.nickname}(${evt.data.author.tag}): 스푼 ${evt.data.amount*evt.data.combo}개로 ${chance}번의 기회 획득. - ${uuids.join(',')}`);
		if ( running === false && cfg.get('options.auto') ) {
			Q.push(tmpQ.shift());
			processor();
		}
	}
}

exports.live_message = (evt, sock) => {
	const message = evt.update_component.message.value;
	if ( message === '!룰렛' ) {
		const idx = tmpQ.findIndex((item) => item.data.author.id === evt.data.user.id);
		if ( idx !== -1 ) {
			const [tmp] = tmpQ.splice(idx, 1);
			tmp.sock = sock;
			Q.push(tmp);
			if ( !running ) {
				processor();
			}
		}
	}
}