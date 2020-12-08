////////////////////////////////////////////////////////////////
//  파일 : webview.js                                         //
//  작성자 : mobbing                                          //
//  주석 : elementLoad 이후 webview element에 대한 스크립트     //
///////////////////////////////////////////////////////////////

const browserEvent = async (evt) => {
	if ( typeof evt.event !== 'string' ) {
		return;
	}

	sopia.debug(`[${evt.event.trim()}]`, evt.data);
	switch ( evt.event.trim() ) {

		case 'snsLoginCallback':
			evt.data = evt.data.result;

		case 'loginCallback':
			const user = spoon.User.deserialize(evt.data);
			const token = await webview.executeJavaScript('localStorage.SPOONCAST_KR_authKey');
			sopia.debug('login', await $sopia.loginToken(user, token.replace('Bearer ', '')));
			break;

		case 'live_join':
			try {
			if ( evt.data.type === spoon.LiveType.LIVE_RSP ) {
				if ( !$sopia.user ) {
					const user = await webview.executeJavaScript('localStorage.SPOONCAST_KR_userInfo');
					if ( user ) {
						await browserEvent({
							event: 'loginCallback',
							data: JSON.parse(user),
						});
					} else {
						noti.error('로그인 정보가 없습니다.');
						return;
					}
				}

				const liveId = evt.data.live_id;
				let sock = $sopia.liveSocketMap.get(liveId);
				if ( sock ) {
					sock.destroy();
				}
				sopia.sock = await $sopia.liveManager.liveJoin(liveId);
				sopia.sock.on(spoon.LiveEvent.LIVE_EVENT_ALL, sopia.onmessage);
				sopia.me = $sopia.user;

				writeLog('SUCCESS', `Live join success (${liveId})`);

				if ( !window.DEBUG_MODE ) {
					if ( sopia.client.user.tag.toString() !== config.license.id.toString() ) {
						// 라이센스 id 와 로그인 한 id가 다르다면,
						window.location.assign('license.html?noti=로그인 한 계정과 인증 계정이 다릅니다.');
					}
				}

				const nowDate = new Date();
				const nDay = nowDate.yyyymmdd('-');
				const nTime = nowDate.hhMMss('-') + '-' + nowDate.getMilliseconds();

				const live = await $sopia.liveManager.liveInfo(liveId);
				sopia.live = live;
				const roomData = {
					title: live.title,
					img_url: live.img_url,
					created: live.created,
					nickname: live.author.nickname,
					tag: live.author.tag,
					room: liveId
				};
				writeLog('SUCCESS', `Live join success (${liveId})`);

				// send join data to firebase server.
				sopia.debug("================== send join data to firebase server ==================");
				axios({
					url: `${sopia.config['api-url']}/join-log/${nDay}/${nTime}.json`,
					method: 'put',
					headers: {
						'Content-Type': 'application/json'
					},
					data: roomData
				}).then(res => {
					sopia.debug("success!");
				}).catch(err => {
					sopia.debug("fail!");
					sopia.error(err);
				});

				// mute sound
				setTimeout(() => {
					webview.executeJavaScript('toggleMute()');
				}, 100);
			}
			} catch(err) {
				console.error(err);
			}
			break;

	}
};

document.querySelectorAll('webview').forEach((element, idx) => {

    //webview에서 받은 콘솔로그를 출력하지만, 그것이 라이브의 이벤트일 경우는 라이브 이벤트로 처리한다.
    element.addEventListener('console-message', (e) => {
        try {
            switch(e.level) {
                case -1: {
                    console.debug(e.message);
                } break;
                case 0: {
                    const obj = JSON.parse(e.message);
					browserEvent(obj);
                } break;
                case 1: {
                    //console.warn(e.message);
                } break;
                case 2: {
                    //console.error(e.message);
                } break;
            }
        } catch (err) {
        }
    });

    //webview의 로딩이 끝났을 때, BrowserInject.js 를 추가한다.
    element.addEventListener('dom-ready', () => {
        //3초 이내는 브라우저 로딩을 단 한 번으로 친다.
        if ( element.isLoaded ) {
            return;
        }
        element.isLoaded = true;
        setTimeout(() => {
            element.isLoaded = false;
        }, 3000);

		sopia.wlog('INFO', 'Webview dom-ready.');

        fs.readFile(getPath("src/resources/js/BrowserInject.js", true), {encoding: "utf8"}, (err, data) => {
            if ( err ) {
                throw err;
            }
            element.executeJavaScript(data);
            if ( sopia.config.autologin.enable ) {
                if ( sopia.config.devel && sopia.config.devel["토큰"] ) {
                    //do not autologin
                } else {
                    element.executeJavaScript(`autoLogin('${sopia.config.autologin.type}', '${sopia.config.autologin.id}', '${sopia.config.autologin.passwd}')`);
                }
            }
        });
    });

});

