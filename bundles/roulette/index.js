if ( !sopia.roulette ) {
	sopia.roulette = sopia.require(getPath(sopia.config.bundle['roulette'] + '/config.json'));
	sopia.roulette.path = getPath(sopia.config.bundle['roulette']);
	sopia.roulette.getPath = (p) => path.join(sopia.roulette.path, p);
}

asleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 배열에서 동등한 확률로 하나 추출
random = (items) => {
	const i = sopia.api.rand(items.length);
	return items[i];
}

/*
 * 특정 확률을 감안한 랜덤값 추출
 * 누적 확률값을 계산해 낮은 확률부터 일치하는 확률 목록을 전부 가져온다.
 * 그 중 하나를 랜덤 추출한다.
 * [{
 * 		value: any
 * 		percentage: flot
 * }]
 */
randPer = (items) => {
	const rand = Math.random() * 100;
	let pickItems = [];
	let pickItem;
	let cumulative = 0;

	items = items.sort((a, b) => a.percentage - b.percentage);

	for ( const item of items ) {
		cumulative = item.percentage;
		console.log('randPer', rand, cumulative);
		if ( rand <= cumulative ) {
			pickItems = items.filter(i => i.percentage === item.percentage);
			break;
		}
	}

	if ( pickItems.length > 1 ) {
		const pick = sopia.api.rand(pickItems.length);
		pickItem = pickItems[pick];
	} else {
		pickItem = pickItems[0];
	}

	return pickItem;
}

sopia.roulette.queue = [];
sopia.roulette.running = false;

sopia.roulette.randomSpeech = [
	(e) => '돌려 돌려 룰렛!',
	(e) => '과연 어떤 게 뽑힐까~?',
	(e) => '이게 좋아보여요. ˳⚆ɞ⚆˳',
	(e) => '나는 뭔지 알고 있지만 안 알려줄거에요. 😝',
	(e) => `${e.author.nickname}님은 뭘 갖고 싶어요?`,
	(e) => '헐. 이게 걸리네? 〣(ºΔº)〣',
];

sopia.roulette.meanlessItems = [
	'평생 모든 편의점 무료 입장권',
	'디제이에게 스푼 쏠 기회',
	'"윤군님 멋있어요!"라고 말하기',
	'마음속으로 노래부르기 벌칙',
	'모든 백화점 무제한 아이쇼핑 쿠폰',
];

sopia.roulette.whackSpeech = [
	async (e) => {
		sopia.send(`헐 ${e.author.nickname}님. 중대발표가 있어요.`);
		await asleep(2000);
		sopia.send(`이번에 당첨되신 항목은 무려...!`);
		await asleep(2000);
		sopia.send('꽝이에요. 뭐지? 버근가?  ¯＼_(ツ)_/¯ ');
		await asleep(2000);
		sopia.send('당첨될 때 까지 ㄱㄱ!');
	},
	async (e) => {
		sopia.send('축하합니다!');
		await asleep(2000);
		sopia.send(`${e.author.nickname}님은 [${random(sopia.roulette.meanlessItems)}]에 당첨되셨습니다!!!`);
		await asleep(2000);
		sopia.send('꽝이란 소리에요. 뭐라도 당첨된 것 처럼 보이는게 좋잖아요. ꉂ (๑¯ਊ¯)σ ');
	},
	async (e) => {
		sopia.send('ㅋㅋㅋ');
		await asleep(1000);
		sopia.send('ㅋㅋㅋㅋㅋㅋ');
		await asleep(1000);
		sopia.send('ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ');
		await asleep(1000);
		sopia.send('꽝ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ');
	},
	async (e) => {
		sopia.send('저런... 꽝이네요.');
		await asleep(2000);
		sopia.send('자, 울지 마시고 한 번 더!');
		await asleep(2000);
		sopia.send(`${sopia.roulette.minPresentNum}스푼밖에 안 해요~.`);
		await asleep(2000);
		sopia.send(`할 수 있다. ${e.author.nickname}님 파이팅!  ꒰◍ॢ•ᴗ•◍ॢ꒱ `);
	},
	async (e) => {
		const reversList = [];
		sopia.roulette.list.forEach((l, idx) => {
			reversList[idx] = {
				percentage: 100 - l.percentage,
				value: l.value,
			};
		});
		let pick;
		do {
			pick = randPer(reversList);
		} while( !pick );
		sopia.send('와......');
		await asleep(2000);
		sopia.send(`${e.author.nickname}님은......`);
		await asleep(2000);
		sopia.send(`[${pick.value}] 당첨!`);
		await asleep(2000);
		sopia.send('이라는 내용의 소설 추천받아요! 사실 꽝입니당~  ༽΄◞ิ౪◟ิ‵༼ ');
	},
];

sopia.roulette.winSpeech = [
	async (e) => {
		sopia.send(`헐 ${e.author.nickname}님. 중대발표가 있어요.`);
		await asleep(2000);
		sopia.send(`이번에 당첨되신 항목은 무려...!`);
		await asleep(2000);
		sopia.send(`[${e.item.value}] 에요!`);
	},
	async (e) => {
		sopia.send('축하합니다!');
		await asleep(2000);
		sopia.send(`${e.author.nickname}님은 [${e.item.value}]에 당첨되셨습니다!!!`);
	},
	async (e) => {
		sopia.send('ㅋㅋㅋ');
		await asleep(1000);
		sopia.send('ㅋㅋㅋㅋㅋㅋ');
		await asleep(1000);
		sopia.send('ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ');
		await asleep(1000);
		sopia.send(`와 이게 [${e.item.value}] 가 당첨되네.`);
	},
	async (e) => {
		sopia.send('와......');
		await asleep(2000);
		sopia.send(`${e.author.nickname}님은......`);
		await asleep(2000);
		sopia.send(`무려 [${e.item.value}] 당첨!`);
	},
],

sopia.roulette.processor =  async () => {
	if ( sopia.roulette.running ) {
		return;
	}

	sopia.roulette.running = true;

	const e = sopia.roulette.queue.shift();
	if ( e.amount * e.combo  >= sopia.roulette.minPresentNum ) {
		const item = randPer(sopia.roulette.list);
		if ( sopia.roulette.useEffect ) {
			sopia.send(`<${e.author.nickname}>님의 도전! ${await runCmd(random(sopia.roulette.randomSpeech), e)}`);
			await asleep(2500);

			let cnt = sopia.roulette.list.length;
			if ( cnt > 5 ) {
				cnt = 5;
			}

			for ( let i=0;i < sopia.roulette.pickTime*cnt;i++ ) {
				sopia.send(`[${random(sopia.roulette.list.map(l => l.value))}] 이걸까?`);
				await asleep(700 + (2000 / sopia.roulette.list.length));
			}
		}

		if ( item ) {
			e.item = item;
			await runCmd(random(sopia.roulette.winSpeech), e);
		} else {
			/* 유비 개ㅅ */
			let flag = true;
			if ( sopia.live.author.tag === 'ub940918' ) {
				if ( sopia.api.rand(1) == 0 ) {
					sopia.send('꽝이에요. 꽝! 아주 그냥 돈까스 다지는 것 마냥 꽝꽝');
					await asleep(1000);
					sopia.send('왜 꽝이냐고요?');
					await asleep(1000);
					sopia.send('절대 유비 방송에서만 꽝 확률을 올린게 아니랍니다.  ༽΄◞ิ౪◟ิ‵༼ ');
					flag = false;
				}
			}
			if ( flag ) {
				await runCmd(random(sopia.roulette.whackSpeech), e);
			}
		}
	}

	sopia.roulette.running = false;
	if ( sopia.roulette.queue.length > 0 ) {
		await asleep(2000);
		await sopia.roulette.processor();
	}
};

sopia.roulette.event = (e) => {
	if ( !sopia.roulette.use ) {
		return;
	}

	if ( !sopia.live ) {
		sopia.live = e.live;
	}

	sopia.roulette.queue.push(e);
	if ( sopia.roulette.running === false ) {
		sopia.roulette.processor();
	}
};

sopia.off('present', sopia.roulette.event);
sopia.on('present', sopia.roulette.event);
