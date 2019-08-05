function sprintf() {
	let format = arguments[0];
	
	for (let i = 1;i < arguments.length;i++) {
		let element = arguments[i];
		format = format.replace(`{${i-1}}`, element);
	};
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

window.getProps = () => {
	let instance = getReactInstance(document.querySelector('div.app-container'))
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

window.SendChat = (str) => {
	let props = getProps();
	if ( props ) {
		props.SocketActions.socketLiveMessage({
			"message":str,
			"event":"live_message"
		});
	}
};

var ws = null;
window.connect_ws = (port) => {
	if ( ws === null ) {
		if ( port && port > 0 && port < 65535 ) {
			ws = new WebSocket(`ws://127.0.0.1:${port}`);
		}
	}
};
window.wsSend = (domain, data) => {
	if ( ws ) {
		let obj = {
			"domain": domain,
			"data": data
		};
		ws.send(JSON.stringify(obj));
	}
};

function logging(a, b, c) {
	let rtn = {
		event: a,
		data: c ? c : b,
	};
	console.info(JSON.stringify(rtn));
};

function setLogging() {
	if ( console.log === logging ) {
		return;
	}
	
	console.log = logging;
};
var logIntervalTime = 2;
var logInterval = setInterval(() => {
	setLogging();
	logIntervalTime *= logIntervalTime;
}, logIntervalTime * 1000);