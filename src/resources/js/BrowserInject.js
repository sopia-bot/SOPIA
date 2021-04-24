function sprintf() {
	let format = arguments[0];
	
	for (let i = 1;i < arguments.length;i++) {
		let element = arguments[i];
		format = format.replace(`{${i-1}}`, element);
	}
	return format;
}

window.getReactEvent = (element) => {
	try {
		let keys = Object.keys(element);
		let k = keys[keys.findIndex(p => {
			if ( p.indexOf('__reactEventHandlers') >= 0 ) return true;
		})];
		return element[k];
	} catch (e) {
		
	}
	return null;
};

window.getReactInstance = (element) => {
	try {
		let keys = Object.keys(element);
		let k = keys[keys.findIndex(p => {
			if ( p.indexOf('__reactInternalInstance') >= 0 ) return true;
		})];
		return element[k];
	} catch (e) {
		
	}
	return null;
};

window.getProps = (type = "live") => {
	const selectors = {
		"live": "div.live-detail-container",
		"app": "div.app-container"
	};

	let instance = getReactInstance(document.querySelector(selectors[type]));
	if ( !instance ) {
		instance = getReactInstance(document.querySelector(selectors['app']));
	}
	return instance?instance.return.stateNode.props:null;
};

window.autoLogin = (type, id, pw) => {
	let props = getProps();
	if ( props ) {
		switch ( type ) {
			case "phone":
			case "email": {
				props.AuthActions.login({
					sns_type: type,
					sns_id: id,
					password: pw
				});
			} break;
			case "facebook":
			case "google": {
				props.AuthActions.startSnsLogin({
					countryCode: "kr",
					snsType: type,
					isAgree: 0
				});
			} break;
		}
	} else {
		setTimeout(() => {
			window.autoLogin(type,id,pw);
		}, 1000);
	}
};

window.addChatBox = (str) => {
	let props = getProps("app");
	if ( props ) {
		if ( !token ) {
			if ( props.authKey ) {
				token = props.authKey.replace("Token ", "");
			}
		}
		props.LiveDetailActions.addLiveComment({
			"type": "message",
			"author": props.userInfo,
			"message": str
		});
	}
};

var token;
window.SendChat = (str) => {
	let props = getProps();
	if ( props ) {
		if ( !token ) {
			if ( props.authKey ) {
				token = props.authKey.replace("Token ", "");
			}
		}
		props.SocketActions.socketLiveMessage({
			"message":str,
			"event":"live_message",
			"appversion": props.appVersion,
			"useragent": "Web",
			"token": token,
			"type":"live_rpt",
		});

		window.addChatBox(str);
	}
};

var userId;
window.searchDataObj = (nodes, key) => {
	if ( !Array.isArray(nodes) ) {
		nodes = nodes._root;
		if ( nodes ) {
			nodes = nodes.nodes;
		}
	}


    for(let i=0;i<nodes.length;i++) {
		n = nodes[i];
		if ( typeof n !== "object" ) continue;

        if ( Array.isArray(n.entry) ) {
            if ( n.entry.includes(key) ) {
                return n.entry[n.entry.indexOf(key)+1];
            }
        } else {
            if( Array.isArray(n.nodes) ) {
                let snode = n.nodes;
                for(j=0;j<snode.length;j++) {
                    sn = snode[j];
                    if ( Array.isArray(sn.entry) ) {
                        if ( sn.entry.indexOf(key) !== -1 ) {
                            return sn.entry[sn.entry.indexOf(key)+1];
                        }
                    }
                }
            }
        }
    }
};

window.toggleMute = () => {
	/*
	let props = getProps();
	if ( props ) {
		props.LivePlayerActions.toggleMute();
	}
	*/
	document.querySelector('button.btn-control.btn-volume').click();
};

var userInfo = 
window.getUserInfo = (id) => {
	let props = getProps('app');
	try {
		if ( props ) {
			if ( !id ) {
				id = searchDataObj(props.userInfo, 'id');
			}

			props.AuthActions.getUserInfo(id).
				then(res => {
					const data = res.data;
					userInfo = data.results[0];
				}).
				catch(err => {
					setTimeout(() => {
						window.getUserInfo(id);
					}, 1000);
				});
		} else {
			throw new Error('no have props');
		}
	} catch(err) {
		setTimeout(() => {
			window.getUserInfo(id);
		}, 1000);
	}
};
getUserInfo();

var liveInfo;
window.getLiveInfo = (id) => {
	let props = getProps('live');
	try {
		if ( props ) {
			if ( !id ) {
				id = searchDataObj(props.liveData, 'id');
			}

			props.LiveDetailActions.getLivesDetailData(id).
				then(res => {
					const data = res.data;
					liveInfo = data.results[0];
				}).
				catch(err => {
					setTimeout(() => {
						window.getLiveInfo(id);
					}, 1000);
				});
		} else {
			throw new Error('no have live props');
		}
	} catch(err) {
		setTimeout(() => {
			window.getLiveInfo(id);
		}, 1000);
	}
};
getLiveInfo();

function logging(a, b, c) {
	let rtn = {
		event: a,
		data: c ? c : b,
	};
	console.info(JSON.stringify(rtn));
}

function setLogging() {
	if ( console.log === logging ) {
		return;
	}
	
	console.log = logging;
}
var logIntervalTime = 2;
var logInterval = setInterval(() => {
	setLogging();
	logIntervalTime *= logIntervalTime;
}, logIntervalTime * 1000);


setTimeout(() => {
	document.querySelector('iframe[name="us-entrypoint-buttonV2"]').remove();
}, 3000);


setInterval(() => {
	const btn = document.querySelector('button.btn-broadcast.create');
	if ( btn ) {
		btn.remove();
	}
}, 1000);