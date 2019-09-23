////////////////////////////////////////////////////////////////
//  파일 : webview.js                                         //
//  작성자 : mobbing                                          //
//  주석 : elementLoad 이후 webview element에 대한 스크립트     //
///////////////////////////////////////////////////////////////


//모든 webview ipc를 달아주며, 해당 @idx 로 21000 이후부터 개인 ipc를 생성한다.
//각 프로그램 당 port의 차이는 100 으로 둔다.
//ex) 21000 / 21100 / 21200 ...
document.querySelectorAll('webview').forEach((element, idx) => {
    // create http server
    element.httpServer = http.createServer((req, res) => {
        res.writeHead(404);
        res.end();
    });
    element.serverPort = parseInt(sopia.config.server.port, 10) + idx;
    element.httpServer.on('error', (err) => {
        if ( err.code === "EADDRINUSE" ) {
            element.serverPort += 100;
            element.httpServer.listen(element.serverPort, () => {});
        }
    });
    element.httpServer.listen(element.serverPort, () => {});

    element.ipcMain = new EventEmitter();
    element.wsServer = new WebSocketServer({
        httpServer: element.httpServer,
        autoAcceptConnections: false,
        maxReceivedFrameSize: sopia.config.server.maxReceivedFrameSize,
        maxReceivedMessageSize: sopia.config.server.maxReceivedMessageSize
    });
    
    //브라우저에서 받은 이벤트를 ipcMain으로 넘김.
    element.wsServer.on('request', (req) => {
        let connection = req.accept(null, req.origin);
        connection.on('message', (msg) => {
            if ( msg.type === 'utf8' ) {
                try {
                    let obj = JSON.parse(msg.utf8Data);
                    if ( obj ) {
                        ipcMain.emit(obj.domain, obj.data);
                    }
                } catch (e) {
                }
            }
        });
    });

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
                } break;
                case 1: {
                    console.warn(e.message);
                } break;
                case 2: {
                    console.error(e.message);
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
            element.executeJavaScript(`connect_ws(${sopia.config.server.port})`);
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


/**
 * @function querySelector
 * @param {String} selector Element Selector
 * 일반적인 querySelector 이나, webview tag에서 사용했을 땐
 * webview 안 body에서 querySelector를 해 promise를 반환한다.
 */
HTMLElement.prototype._querySelector = HTMLElement.prototype.querySelector;
HTMLElement.prototype.querySelector = function(selector) {
    if ( this.tagName === "WEBVIEW" ) {
        return new Promise((resolve, reject) => {
            if ( selector ) {
                this.ipcMain.on('querySelector', (value) => {
                    let element = value.toString().htmlToElements();
                    if ( element ) {
                        resolve(element.childNodes[0]);
                    } else {
                        reject('query search error')
                    }
                });
                this.executeJavaScript(`
                    wsSend("querySelector", document.body.querySelector(\`${selector}\`) ? document.body.querySelector(\`${query}\`).outerHTML : "");
                `);
            } else {
                reject('query is undefined');
            }
        });
    } else {
        return this._querySelector(selector);
    }
};

/**
 * @function querySelectorAll
 * @param {String} selector Element Selector
 * 일반적인 querySelectorAll 이나, webview tag에서 사용했을 땐
 * webview 안 body에서 querySelectorAll을 해 promise를 반환한다.
 */
HTMLElement.prototype._querySelectorAll = HTMLElement.prototype.querySelectorAll;
HTMLElement.prototype.querySelectorAll = (query) => {
    if ( this.tagName === "WEBVIEW" ) {
        return new Promise((resolve, reject) => {
            if ( query ) {
                this.ipcMain.on('querySelectorAll', (value) => {
                    let element = value.toString().htmlToElements();
                    if ( element && element.length > 0 ) {
                        resolve(element.querySelectorAll(query));
                    } else {
                        reject('query search error')
                    }
                });
                webview.executeJavaScript(`
                    wsSend("querySelectorAll", document.body.innerHTML);
                `);
            } else {
                reject('query is undefined');
            }
        });
    } else {
        return this._querySelector(selector);
    }
};