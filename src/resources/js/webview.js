////////////////////////////////////////////////////////////////
//  파일 : webview.js                                         //
//  작성자 : mobbing                                          //
//  주석 : elementLoad 이후 webview element에 대한 스크립트     //
///////////////////////////////////////////////////////////////


//모든 webview ipc를 달아주며, 해당 @idx 로 21000 이후부터 개인 ipc를 생성한다.
//각 프로그램 당 port의 차이는 100 으로 둔다.
//ex) 21000 / 21100 / 21200 ...
document.querySelectorAll('webview').forEach((element, idx) => {

    //webview에서 받은 콘솔로그를 출력하지만, 그것이 라이브의 이벤트일 경우는 라이브 이벤트로 처리한다.
    element.addEventListener('console-message', (e) => {
        try {
            switch(e.level) {
                case -1: {
                    console.debug(e.message);
                } break;
                case 0: {
                    let obj = JSON.parse(e.message);
                    if ( typeof obj.event === "string" && obj.event.indexOf("live_") == 0 ) {
                        sopia.onmessage(obj);
                    } else {
                    }
                    obj = null;
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

