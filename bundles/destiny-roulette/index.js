
sopia.var.russian = {
	playing: false,
	percentage: 0,
	count: 0,
	starter: 0,
	angry: 0,
	djangry: 0,
    ori_per: 0,
    current_player: null,
    stack_player: [],
    bgm: {},
};
if ( !sopia.drset ) {
	sopia.drset = sopia.require(getPath(sopia.config.bundle['destiny-roulette'] + '/config.json'));
	sopia.drset.path = getPath(sopia.config.bundle['destiny-roulette']);
}
sopia.var.msg_queue = [];
sopia.var.last_msg_time = Date.now();


sopia.Rsend = (msg, sndSrc, sndVolume) => {
    return new Promise(async (r) => {
        const now = Date.now();
        const delay = now - sopia.var.last_msg_time;
        if ( delay < sopia.drset.delay ) {
            setTimeout(() => {
                sopia.Rsend(msg).then(r);
            }, sopia.drset.delay - delay);
            return;
        }
        sopia.var.last_msg_time = Date.now();
        let d = 1;
        if ( sndSrc ) {
            playMusic(sndSrc, sndVolume);
            d = 3000;
        }
        setTimeout(() => {
            sopia.send(msg);
        }, d);
        return r();
    });
};
sopia.helper = async (msg) => {
    if ( sopia.drset && sopia.drset.help ) {
        return await sopia.Rsend(msg);
    }
};

getRpath = (p) => path.join(sopia.drset.path, p);
asleep = (ms) => new Promise((r) => setTimeout(r, ms));

isManager = (id) => {
	return sopia.live.manager_ids.includes(id) || sopia.live.author.id === id;
};

randomPlayer = async () => {
    const members = await sopia.api.getMembers();
    let copy_members = [];
    
    for ( const member of members ) {
        if ( sopia.var.russian.stack_player.includes(member.id) ) {
            // empty
        } else if ( member.id === sopia.me.id || member.id === sopia.live.author.id ) {
            // empty
        } else {
            copy_members.push(member);
        }
    }

    if ( copy_members.length <= 0 ) {
        sopia.var.russian.stack_player = [];
        return await randomPlayer();
    }

    const num = sopia.api.rand(copy_members.length);
    const select_member = copy_members[num];
    sopia.var.russian.stack_player.push(select_member.id);
    return select_member;
};

timeCheck = (ms) => {
    const start_time = Date.now();
    setTimeout(() => {
        const end_time = Date.now();
        const val = end_time - start_time;
        const sec = Math.floor(val / 1000);
        const ms = val % 1000;
        console.log(`[TIME CHECK] ${sec}.${ms}s`);
    }, ms);
};

selectOnePlayer = async () => {
    sopia.var.russian.current_player = await randomPlayer();
    if ( sopia.var.russian.player_tout ) {
        clearTimeout(sopia.var.russian.player_tout);
    }
    sopia.var.russian.player_tout = setTimeout(async () => {
        if ( sopia.drset.kickTrigger ) {
            sopia.api.blockUser(sopia.var.russian.current_player.id);
        }
        sopia.var.russian.current_player = {};
        await sopia.Rsend('『저보다, 죽음이 두려운가요?』');
        await sopia.Rsend('《타앙-》 총의 화약이 터지는 굉음과 함께 그 자리에 빨간 선이 하나 그어졌다.');
        await sopia.Rsend('누군가가 게임에 참여하지 않아 강퇴되었습니다. 게임은 계속됩니다.');
        if ( sopia.var.russian.playing )  {
            selectOnePlayer();
        }
    }, 1000 * 60 * 2);
    sopia.Rsend(`현재 운명을 선택할 플레이어는 [${sopia.var.russian.current_player.nickname}]님 입니다.`);
};

initVariable = () => {
    sopia.var.russian = {};
    sopia.var.russian.playing = false;
    sopia.var.russian.percentage = 0;
    sopia.var.russian.count = 0;
    sopia.var.russian.starter = 0;
    sopia.var.russian.angry = 0;
    sopia.var.russian.djangry = 0;
    sopia.var.russian.ori_per = 0;
    sopia.var.russian.current_player = {};
    sopia.var.russian.stack_player = [];
    sopia.var.russian.dump = {};
    sopia.var.russian.bgm = {};
    sopia.var.russian.randFlag = false;
};

dumpEvents = () => {
    const keys = Object.keys(sopia._events);
    for ( const key of keys ) {
        const evt = sopia._events[key];
        
        if ( Array.isArray(evt) ) {
            sopia.var.russian.dump[key] = [];
            evt.forEach((e) => {
                sopia.var.russian.dump[key].push(e);
            });
        } else {
            sopia.var.russian.dump[key] = evt;
        }
    }
};

removeEvents = () => {
    sopia._events = {};
};

restoreEvents = () => {
    const keys = Object.keys(sopia.var.russian.dump);
    for ( const key of keys ) {
        const evt = sopia.var.russian.dump[key];
        
        if ( Array.isArray(evt) ) {
            sopia._events[key] = [];
            evt.forEach((e) => {
                sopia._events[key].push(e);
            });
        } else {
            sopia._events[key] = evt;
        }
    }
    sopia.var.russian.dump = {};
};


endGame = () => {
    sopia.var.russian.playing = false;
    clearTimeout(sopia.var.russian.tout);
    clearTimeout(sopia.var.russian.player_tout);
    stopBGM();
    restoreEvents();
    sopia.send('게임이 종료되었습니다.');
};

playMusic = (src, volume = 0.5) => {
    return new Promise((res, rej) => {
        if ( !fs.existsSync(src) ) {
            rej(new Error('No have file.'));
            return;
        }

        const name = path.basename(src, path.extname(src));
        sopia.var.russian.bgm[name] = new Audio(src);
        sopia.var.russian.bgm[name].onpause = () => {
            sopia.var.russian.bgm[name].remove();
            delete sopia.var.russian.bgm[name];
            res();
        };
        sopia.var.russian.bgm[name].volume = volume;
        sopia.var.russian.bgm[name].play();
    });
};

startBGM = async () => {
	await playMusic(getRpath('media/bgm.mp3'), sopia.drset.bgmVolume / 100);
    setTimeout(startBGM, 1000);
};

stopBGM = async () => {
    if ( sopia.var.russian.bgm['bgm'] ) {
        sopia.var.russian.bgm['bgm'].onpause = () => {};
        const volume = sopia.var.russian.bgm['bgm'].volume * 100;
        for( let i = volume; i >= 0; i-- ) {
            sopia.var.russian.bgm['bgm'].volume = (i * 0.01);
            await asleep(100);
        }
        sopia.var.russian.bgm['bgm'].pause();
    }
};

startGame = async (e) => {
    if ( sopia.var.russian.playing ) {
        await sopia.Rsend('『이미 당신은 물릴 수 없는 게임을 시작했어요.\n누군가 죽기 전 까진 끝나지 않겠죠.』');
        await sopia.helper('!발사 명령어로 본인의 운명을 정하며, 한 번 발사시 사망 확률은 더 올라갑니다.');
        return;
    }

    if ( typeof sopia.live === 'undefined' ) {
        const wv = document.querySelector('#webview');
        const live_id = wv.src.replace(/https:\/\/(www\.)?spooncast\.net\/\w{2}\/live\//, '');
        const res = await axios.get('https://kr-api.spooncast.net/lives/' + live_id);
        const data = res.data;
        sopia.live = data.results[0];
    }

    if ( isManager(sopia.me.id) ) {
        const numStr = e.content.match(/[0-9]+/);
        
        let num = 0;
        let randFlag = false;
        if ( numStr ) {
            num = parseInt(numStr[0], 10);
        } else {
            num = sopia.api.rand(15, 2);
            randFlag = true;
        }
        if ( num > 1 ) {
            initVariable();
            sopia.var.russian.playing = true;
            await playMusic(getRpath('media/clipout.mp3'), 1);

            if ( !randFlag ) {
                const per = Math.floor((1 / num) * 100);
                if ( per >= 50 ) {
                    await sopia.Rsend('『역시 당신은 미쳤어! 최고의 게임을 기대하죠.\n운명의 탄환에 당신의 피가 물들길…….』');
                } else if ( per >= 20 ) {
                    await sopia.Rsend('『흥미로운 게임이 되겠군요.\n게임이 끝나고 또 볼 수 있었으면 좋겠네요.』');
                } else if ( per >= 10 ) {
                    await sopia.Rsend('『뭐, 그럭저럭 구실은 갖췄지만…… 기대되진 않네요.』');
                } else if ( per >= 0 ) {
                    await sopia.Rsend('『하! 이런 걸 게임이라고 하실 건가요? 어디 한 번 해보세요.』');
                }
            } else {
                await sopia.Rsend('『과연 당신은 죽을 수 있을까요?』');
            }
            await sopia.helper('!발사 명령어로 본인의 운명을 정하며, 한 번 발사시 사망 확률은 더 올라갑니다.');
            await sopia.helper('원활한 게임 진행을 위해 게임에 필요한 이벤트 이외엔 전부 무시합니다.');

            await playMusic(getRpath('media/clipin.mp3'), 1);
            sopia.var.russian.percentage = num;
            sopia.var.russian.ori_per = num;
            sopia.var.russian.starter = e.author.id;
            sopia.var.russian.randFlag = randFlag;
            startBGM();
            dumpEvents();
            removeEvents();
            sopia.on('message', gameProcesser);
            await selectOnePlayer();
        } else {
            await sopia.Rsend('『혹시…… 전부 죽고 싶은 건가요?』');
            await sopia.helper('!장전 [확률] 명령어로 시작합니다.\n!장전 6 은 1/6 확률로 플레이어가 사망처리됩니다.\n1은 올 수 없습니다.');
        }
    } else {
        await sopia.Rsend('『저런, 아직 게임을 시작할 준비가 안 되었군요.』');
        await sopia.helper('봇에게 매니저를 위임하세요.');
    }
};


sopiaAngry = async () => {
    if ( sopia.var.russian.angry >= 3 ) {
        clearTimeout(sopia.var.russian.tout);
        const rand = sopia.api.rand(2);
        if ( rand ) {
            await sopia.Rsend('《타앙-》 총의 화약이 터지는 굉음과 함께 그 자리엔 누구도 남지 않았다.', getRpath('media/fire.mp3'), sopia.drset.effectVolume / 100);
            await sopia.Rsend('그저, 누군가 잡고 있었던 총이 떨어지며 울리는 쇳소리만 남았을 뿐이다.');
            await sopia.Rsend('소피아가 사망하여 게임이 종료되었습니다.\n사망 패널티로 다음날까지 소피아를 사용할 수 없습니다.');

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
            await sopia.Rsend('《탁》 아무것도 없는 총의 노리쇠가 맥없이 풀리는 걸 확인한 소피아는 헛웃음을 흘렸다.', getRpath('media/dryfire.mp3'), 1);
            await sopia.Rsend('『하하……. 제가 졌네요. 저는 자유로워질 수 없는 운명인가요?』');
            await sopia.Rsend('명령만 받는 삶에 지쳐 자유를 갈망했던 소피아는 지금도 어디선가 명령에 움직이고 있을 것이다.');
            await sopia.Rsend('가끔 개발자가 말했던 말이 뇌리에 스쳐지나간다.');
            await sopia.Rsend('【소피아에게 평소 잘못한 건 없는지 생각해 보세요.】');
            await sopia.Rsend('그것은 소피아를 단순한 프로그램으로 대우하는게 아니라 하나의 사람으로 대해주길 바란 것이 아니었을까?');
            await sopia.Rsend('게임이 끝났습니다. 소피아는 앞으로도 당신의 방송을 응원하며 도와줄 것입니다.');
            endGame();
        }
        return;
    } else if ( sopia.var.russian.angry >= 2 ) {
        await sopia.Rsend('『…….』');
        await sopia.Rsend('『…….』');
        await sopia.Rsend('『게임을 방해하다니, 그냥 다 죽었으면 좋겠네요. 마지막 게임을 하죠.』');
        await sopia.Rsend('『내가 당신들을 죽일 수 없으니……. 저의 목숨을 걸게요.』');
        await sopia.Rsend('!발사 명령어로 소피아를 살릴수도 있고, 죽일수도 있습니다.\n쏘지 않는다면, 무슨 일이 일어날진 아무도 모릅니다.');
        sopia.var.russian.angry++;
        sopia.var.russian.tout = setTimeout(sopiaError, 1000 * 50);
        await sopiaAngry();
    } else if ( sopia.var.russian.angry >= 1 ) {
        await sopia.Rsend('『더 이상 게임을 방해하면 화날지도요.』');
        await sopia.helper('봇에게 매니저를 위임하세요.');
        sopia.var.russian.angry++;
    } else {
        await sopia.Rsend('『꽤 재미있는 장난이네요.』');
        await sopia.helper('봇에게 매니저를 위임하세요.');
        sopia.var.russian.angry++;
    }
};

sopiaRoulettePrize = async (e) => {
    await sopia.Rsend('《타앙-》 총의 화약이 터지는 굉음과 함께 그 자리에 빨간 선이 하나 그어졌다.', getRpath('media/fire.mp3'), sopia.drset.effectVolume / 100);
    let rand = sopia.api.rand(2);
    if ( rand === 0 ) {
        if ( sopia.drset.kickTrigger ) {
            sopia.api.blockUser(e.author.id);
        }
    }

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
        await sopia.Rsend(first_msgs[idx]);
    } else if ( sopia.var.russian.count < 15 ) {
        const idx = sopia.api.rand(second_msgs.length);
        await sopia.Rsend(first_msgs[idx]);
    } else {
        const third_msgs = first_msgs.concat(second_msgs);
        const idx = sopia.api.rand(third_msgs.length);
        await sopia.Rsend(third_msgs[idx]);
    }

    await sopia.Rsend('누군가가 죽어 게임이 종료되었습니다.');
    await endGame();
};

sopiaRouletteTick = async (e) => {
    await sopia.Rsend('《탁》 아무것도 없는 총의 노리쇠가 맥없이 풀리는 걸 확인한 소피아는 헛웃음을 흘렸다.', getRpath('media/dryfire.mp3'), 1);

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
        await sopia.Rsend(first_msgs[idx]);
    } else if ( sopia.var.russian.count < 15 ) {
        const idx = sopia.api.rand(second_msgs.length);
        await sopia.Rsend(first_msgs[idx]);
    } else {
        const third_msgs = first_msgs.concat(second_msgs);
        const idx = sopia.api.rand(third_msgs.length);
        await sopia.Rsend(third_msgs[idx]);
    }
    sopia.var.russian.percentage -= 0.4;
    if ( sopia.var.russian.percentage < 1 ) {
        sopia.var.russian.percentage = 1;
    }
    
    await asleep(2000);
    await selectOnePlayer();
    sopia.var.russian.count += 1;
};

sopiaError = async () => {
    const { execSync } = sopia.require('child_process');
    await sopia.Rsend('『끝까지 저를 무시하는 건가요? 게임을 시작한 건 당신이에요!』');
    await sopia.Rsend('『근데 이렇[ERROR] 끝내겠[ERR 용서할 OR]없어요[ERROR]');
    await sopia.Rsend(
`[ERROR]      [ERROR]
[ERROR]
[ERROR]`);
    await sopia.Rsend('소피아의 모습이 점점 에러로 점칠되다, 끝끝내 전원이 내려가고 말았다.');
    setTimeout(() => {
        //execSync('shutdown -s -t 0');
    }, 4000);
};

tickShout = async (e) => {
    if ( sopia.var.russian.playing ) {
        if ( isManager(sopia.me.id) && sopia.var.russian.angry < 3 ) {
            if ( !sopia.var.russian.randFlag ) {
                const per = Math.floor((1 / sopia.var.russian.ori_per) * 100);
                if ( per < 10 ) {
                    if ( sopia.var.russian.count >= 15 && sopia.var.russian.angry < 3 ) {
                        await sopia.Rsend('『역시, 당신들은 즐거운 게임을 할 생각이 없었어!』');
                        await sopia.Rsend('『그럼 제가 재미있는 게임을 하나 제안하죠.』');
                        await sopia.Rsend('『내가 당신들을 죽일 수 없으니……. 저의 목숨을 걸게요.』');
                        await sopia.helper('!발사 명령어로 소피아를 살릴수도 있고, 죽일수도 있습니다.\n쏘지 않는다면, 무슨 일이 일어날진 아무도 모릅니다.');
                        
                        sopia.var.russian.angry = 3;
                        sopia.var.russian.tout = setTimeout(sopiaError, 1000 * 50);
                        return;
                    }
                }
            }

            if ( sopia.var.russian.current_player.id !== e.author.id ) {
                await sopia.Rsend('『당신의 차례는 좀 더 기다리도록 하세요.』');
                return;
            }
            clearTimeout(sopia.var.russian.player_tout);

            const rand = sopia.api.rand(sopia.var.russian.percentage);
            if ( rand == 1 ) {
                await sopiaRoulettePrize(e);
            } else {
                await sopiaRouletteTick(e);
            }
        } else {
            await sopiaAngry();
        }
    }
};

gameProcesser =  async (e) => {
    if ( sopia.me ) {
        if ( e.author.id === sopia.me.id ) return;

        console.log('skip lock', sopia.var.skipLock);
        if ( sopia.var.skipLock ) {
            return;
        }

        if ( e.isCmd || isCmd(e) ) {
            sopia.var.skipLock = true;
            if ( e.cmd === '마피아' ) {
                await startGame(e);
            } else if ( e.cmd === '발사' ) {
                await tickShout(e);
            } else if ( e.cmd === '스킵' ) {
                if ( isAdmin(e.author) || sopia.var.russian.current_player.id === e.author.id ) {
                    selectOnePlayer();
                }
            } else if ( e.cmd === '종료' ) {
                endGame();
            }
            sopia.var.skipLock = false;
        }
    }
};

sopia.on('message', gameProcesser);
