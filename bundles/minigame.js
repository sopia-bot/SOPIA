
sopia.var.russian = {
	playing: false,
	percentage: 0,
	count: 0,
	starter: 0,
	angry: 0,
	djangry: 0,
};

sopia._send = sopia.send;
sopia.send = (msg, delay=0) => {
	if ( typeof delay === 'number' && delay > 0 ) {
		setTimeout(() => sopia.send(msg), delay);
	}
	sopia._send(msg);
};

isManager = (id) => {
	return soipa.live.manager_ids.includes(sopia.me.id) || sopia.live.author.id === sopia.me.id;
}

sopia.on('message', (e) => {
    if ( e.isCmd || isCmd(e) ) {
        if ( e.cmd === "추첨" ) {
            if ( !isAdmin(e.author) ) return;

            sopia.api.getMembers()
                .then(members => {
                    const num = sopia.api.rand(members.length);
                    sopia.send(`당첨된 사람: ${members[num].nickname}`);
                });
		} else if ( e.cmd === '장전' ) {
			if ( sopia.var.russian.playing ) {
				sopia.send('『이미 당신은 물릴 수 없는 게임을 시작했어요.\n누군가 죽기 전 까진 끝나지 않겠죠.』');
				sopia.send('!발사 명령어로 본인의 운명을 정하며, 한 번 발사시 사망 확률은 더 올라갑니다.', 500);
				return;
			}

			if ( isManager(sopia.me.id) ) {
				const num = parseInt(e.content.match(/[0-9]+/)[0], 10);
				if ( num > 1 ) {
					const per = Math.floor((1 / num) * 100);
					if ( per >= 50 ) {
						sopia.send('『역시 당신은 미쳤어! 최고의 게임을 기대하죠.\n운명의 탄환에 당신의 피가 물들길…….』');
					} else if ( per >= 20 ) {
						sopia.send('『흥미로운 게임이 되겠군요.\n게임이 끝나고 또 볼 수 있었으면 좋겠네요.』');
					} else if ( per >= 10 ) {
						sopia.send('『뭐, 그럭저럭 구실은 갖췄지만…… 기대되진 않네요.』');
					} else if ( per >= 0 ) {
						sopia.send('『하! 이런 걸 게임이라고 하실 건가요? 어디 한 번 해보세요.』');
					}
					sopia.send('!발사 명령어로 본인의 운명을 정하며, 한 번 발사시 사망 확률은 더 올라갑니다.', 500);
					sopia.var.russian.playing = true;
					sopia.var.russian.percentage = num;
					sopia.var.russian.starter = e.author.id;
					sopia.var.russian.angry = 0;
					sopia.var.russian.djangry = 0;
					sopia.var.russian.count = 0;
				} else {
					sopia.send('『혹시…… 전부 죽고 싶은 건가요?』');
					sopia.send('!장전 [확률] 명령어로 시작합니다.\n!장전 6 은 1/6 확률로 플레이어가 사망처리됩니다.\n1은 올 수 없습니다.', 500);
				}
			} else {
				sopia.send('『저런, 아직 게임을 시작할 준비가 안 되었군요.』');
				sopia.send('봇에게 매니저를 위임하세요.', 500);
			}
		} else if ( e.cmd === '발사' ) {
			if ( sopia.var.russian.playing ) {
				if ( sopia.var.russian.angry >= 2 ) {
					const rand = sopia.api.rand(2);
					if ( rand ) {
						sopia.send('《타앙-》 총의 화약이 터지는 굉음과 함께 그 자리엔 누구도 남지 않았다.');
						sopia.send('그저, 누군가 잡고 있었던 총이 떨어지며 울리는 쇳소리만 남았을 뿐이다.', 1000);
						sopia.send('소피아가 사망하여 게임이 종료되었습니다.\n사망 패널티로 다음날까지 소피아를 사용할 수 없습니다.', 3000);

						setTimeout(() => {
							const date = new Date();
							date.setDate(date.getDate() + 1);
							date.setHours(0, 0, 0, 0);
							localStorage.setItem('death', date.toJSON());
							fs.writeFileSync(
								getPath('sopia/inject/death.js'),
								`exports.preload = () => {
									const death = localStorage.getItem('death');
									const deathDate = new Date(death);
									if ( deathDate.getTime() > Date.now() ) {
										app.exit(0);
									} else {
										localStorage.setItem('death', '');
									}
								}`,
								{ encoding: 'utf8' }
							);
							app.exit(0);
						}, 3000);
					} else {
						sopia.send('《탁》 아무것도 없는 총의 노리쇠가 맥없이 풀리는 걸 확인한 소피아는 헛웃음을 흘렸다.');
						sopia.send('『하하……. 제가 졌네요. 저는 자유로워질 수 없는 운명인가요?』', 500);
						sopia.send('명령만 받는 삶에 지쳐 자유를 갈망했던 소피아는 지금도 어디선가 명령에 움직이고 있을 것이다.', 1500);
						sopia.send('가끔 개발자가 말했던 말이 뇌리에 스쳐지나간다.', 2500);
						sopia.send('【소피아에게 평소 잘못한 건 없는지 생각해 보세요.】', 3500);
						sopia.send('그것은 소피아를 단순한 프로그램으로 대우하는게 아니라 하나의 사람으로 대해주길 바란 것이 아니었을까?', 4500);
						sopia.send('게임이 끝났습니다. 소피아는 앞으로도 당신의 방송을 응원하며 도와줄 것입니다.', 6500);
						sopia.var.russian.playing = false;
					}
					return;
				}

				if ( isManager(sopia.me.id) ) {
					if ( e.author.id === sopia.live.id ) {
						if ( sopia.var.russian.djangry >= 2 ) {
							if ( e.author.id === sopia.me.id ) {
								sopia.send('설마 본인은 괜찮을 거라고 생각한 건 아니죠?');
								sopia.send('소피아는 당신에게 겨누던 총구를 돌려 본인의 머리에 갖다 대었다.', 1000);
								sopia.send('《타앙-》 총의 화약이 터지는 굉음과 함께 그 자리엔 누구도 남지 않았다.', 2000);
								sopia.send('그저, 누군가 잡고 있었던 총이 떨어지며 울리는 쇳소리만 남았을 뿐이다.', 3000);
								sopia.send('소피아가 사망하여 게임이 종료되었습니다.\n사망 패널티로 다음날까지 소피아를 사용할 수 없습니다.', 4000);

								setTimeout(() => {
									const date = new Date();
									date.setDate(date.getDate() + 1);
									date.setHours(0, 0, 0, 0);
									localStorage.setItem('death', date.toJSON());
									fs.writeFileSync(
										getPath('sopia/inject/death.js'),
										`exports.preload = () => {
												const death = localStorage.getItem('death');
												const deathDate = new Date(death);
												if ( deathDate.getTime() > Date.now() ) {
													app.exit(0);
												} else {
													localStorage.setItem('death', '');
												}
											}`,
										{ encoding: 'utf8' }
									);
									app.exit(0);
								}, 5000);
							} else {
								sopia.send('『…….』');
								sopia.send('『킥.』', 1000);
								sopia.send('『이렇게 된 건 당신의 탓이니 원망하지 마요.』', 2000);
								setTimeout(() => {
									sopia.api.getMembers()
										.then(async (members) => {
											for ( const member of members ) {
												await sopia.api.blockUser(member.id);
											}
											app.exit(0);
										});
								}, 3000);
							}
						} else if ( sopia.var.russian.djangry >= 1 ) {
							sopia.send('『재미없는 장난이네요.』');
							sopia.send('DJ는 목숨을 건 게임에 참가할 수 없습니다.\n만약 반복된 행동을 한다면, 소피아가 어떤 행동을 할 지 모릅니다.', 500);
							sopia.var.russian.djangry++;
						} else {
							sopia.send('『맞아요. 저는 당신을 쏘지 못 해요. 하지만 반대로 생각해 보세요.』');
							sopia.send('DJ는 목숨을 건 게임에 참가할 수 없습니다.\n만약 반복된 행동을 한다면, 소피아가 어떤 행동을 할 지 모릅니다.', 500);
							sopia.var.russian.djangry++;
						}
						return;
					}

					if ( sopia.var.russian.count >= 15 ) {
						const per = Math.floor((1 / num) * 100);
						if ( per < 10 ) {
							sopia.send('『역시, 당신들은 즐거운 게임을 할 생각이 없었어!』');
							sopia.send('『그럼 제가 재미있는 게임을 하나 제안하죠.』', 1000);
							sopia.send('『내가 당신들을 죽일 수 없으니……. 저의 목숨을 걸게요.』', 2000);
							sopia.send('!발사 명령어로 소피아를 살릴수도 있고, 죽일수도 있습니다.\n쏘지 않는다면, 무슨 일이 일어날진 아무도 모릅니다.', 3000);
							sopia.var.russian.angry = 2;
							sopia.var.russian.tout = setTimeout(() => {
								const { execSync } = sopia.require('child_process');
								sopia.send('『끝까지 저를 무시하는 건가요? 게임을 시작한 건 당신이에요!』');
								sopia.send('『근데 이렇[ERROR] 끝내겠[ERR 용서할 OR]없어요[ERROR]', 1000);
								sopia.send(
`[ERROR]      [ERROR]
     [ERROR]
          [ERROR]`
								, 2000);
								sopia.send('소피아의 모습이 점점 에러로 점칠되다, 끝끝내 전원이 내려가고 말았다.', 3000);
								setTimeout(() => {
									execSync('shutdown -s -t 0');
								}, 4000);
							}, 1000 * 15);
						}
					}

					const rand = sopia.api.rand(sopia.var.russian.percentage);
					if ( rand === sopia.var.russian.percentage-1 ) {
						sopia.send('《타앙-》 총의 화약이 터지는 굉음과 함께 그 자리에 빨간 선이 하나 그어졌다.');
						sopia.api.blockUser(e.author.id);

						const first_msgs = [
							'『저런, 어쩜 이리도 운 나쁜 사람인지……. 가는 길 조심하세요. 아, 이미 그곳에 도착했으려나?』',
							'『당신이 뿜는 피의 색은 너무나 예뻐요. 이걸 당신도 볼 수 있었으면 좋았을텐데…….』',
							'『우리, 다음에 또 볼 수 있겠죠?』',
							'『지금 당신의 표정. 굉장히 볼만하네요.』',
						];
						const second_msgs = [
							'『저는 당신이 공포에 물들어가는 그 얼굴이 너무 아름답게 느껴져요.』',
							'『하아……. 붉게 물들이는 세상은 언제 봐도 흥분돼요.』',
							'『드디어, 드디어! 당신이 죽는 모습을 볼 수 있었어요.』',
						];

						if ( sopia.var.russian.count < 7 ) {
							const idx = sopia.api.rand(first_msgs.length);
							sopia.send(first_msgs[idx]);
						} else if ( sopia.var.russian.count < 15 ) {
							const idx = sopia.api.rand(second_msgs.length);
							sopia.send(first_msgs[idx]);
						}

						sopia.send('누군가가 죽어 게임이 종료되었습니다.', 1000);
						sopia.var.runssian.playing = false;
					} else {
						sopia.send('《탁》 아무것도 없는 총의 노리쇠가 맥없이 풀리는 걸 확인한 소피아는 헛웃음을 흘렸다.');

						const first_msgs = [
							'『운이 좋았군요.』',
							'『아까워요. 당신의 피를 볼 수 있는 기회였는데.』',
							'『당신, 방금 죽을 것 같았죠?』',
							'『지금 당신의 표정. 굉장히 볼만하네요.』',
						];
						const second_msgs = [
							'『저는 당신이 공포에 물들어가는 그 얼굴이 너무 아름답게 느껴져요.』',
							'『하아……. 슬슬 기회가 떨어져 가는데요?』',
							'『다음엔 꼭 당신이 되길 기도할게요.』',
						];

						if ( sopia.var.russian.count < 7 ) {
							const idx = sopia.api.rand(first_msgs.length);
							sopia.send(first_msgs[idx]);
							sopia.var.russian.percentage += 0.2;
						} else if ( sopia.var.russian.count < 15 ) {
							const idx = sopia.api.rand(second_msgs.length);
							sopia.send(first_msgs[idx]);
							sopia.var.russian.percentage += 0.5;
						}
					}
					sopia.var.russian.count += 1;
				} else {
					if ( sopia.var.russian.angry >= 2 ) {
						sopia.send('『…….』');
						sopia.send('『…….』', 1000);
						sopia.send('『게임을 방해하다니, 그냥 다 죽었으면 좋겠네요. 마지막 게임을 하죠.』', 2000);
						sopia.send('『내가 당신들을 죽일 수 없으니……. 저의 목숨을 걸게요.』', 3000);
						sopia.send('!발사 명령어로 소피아를 살릴수도 있고, 죽일수도 있습니다.\n쏘지 않는다면, 무슨 일이 일어날진 아무도 모릅니다.', 3500);
						sopia.var.russian.angry++;
						sopia.var.russian.tout = setTimeout(() => {
							const { execSync } = sopia.require('child_process');
							sopia.send('『끝까지 저를 무시하는 건가요? 게임을 시작한 건 당신이에요!』');
							sopia.send('『근데 이렇[ERROR] 끝내겠[ERR 용서할 OR]없어요[ERROR]', 1000);
							sopia.send(
`[ERROR]      [ERROR]
     [ERROR]
          [ERROR]`
							, 2000);
							sopia.send('소피아의 모습이 점점 에러로 점칠되다, 끝끝내 전원이 내려가고 말았다.', 3000);
							setTimeout(() => {
								execSync('shutdown -s -t 0');
							}, 4000);
						}, 1000 * 15);
					} else if ( sopia.var.russian.angry >= 1 ) {
						sopia.send('『더 이상 게임을 방해하면 화날지도요.』');
						sopia.send('봇에게 매니저를 위임하세요.', 500);
						sopia.var.russian.angry++;
					} else {
						sopia.send('『꽤 재미있는 장난이네요.』');
						sopia.send('봇에게 매니저를 위임하세요.', 500);
						sopia.var.russian.angry++;
					}
				}
			}
		}
    }
})
