const fs = require("fs");
const { NotiData } = require("sopia-core");
const httpReq = require('request');

let token = '';
let voiceList = [];
let gAccount = null;

const apiUrl = 'https://typecast.ai/api';
const fbKey = 'AIzaSyA7rq_sg-scoKIMWPbq7MJ-3kGu7W1Uouw';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const getVoiceList = async () => {
	const res = await axios({
		url: apiUrl + '/actor',
		method: 'get',
		params: {
			role: 'prosody',
		},
		headers: {
			authorization: 'Bearer ' + token,
		},
	});
	voiceList = res.data.result;
	return voiceList;
};

const speakPost = async (actor_id, text, option = {}) => {
	if ( !actor_id ) {
		throw Error('actor_id is undefined');
	}

	if ( !text ) {
		throw Error('text is undefined');
	}

	const defOpt = {
		gid: 'xCLCFg45c69rEVU0ilQ-r',
		lang: 'auto',
		max_seconds: 20,
		naturalness: 0.8,
		speed_x: 1,
		style_idx: 0,
		actor_id,
		text,
	};

	for ( const [key, val] of Object.entries(option) ) {
		defOpt[key] = val;
	}

	const res = await axios({
		url: apiUrl + '/speak/batch/post',
		method: 'post',
		headers: {
			authorization: 'Bearer ' + token,
		},
		data: [ defOpt ],
	});

	const result = res.data.result;
	return result.speak_urls;
};

const speakGet = async (speakUrls) => {
	const res = await axios({
		url: apiUrl + '/speak/batch/get',
		method: 'post',
		headers: {
			authorization: 'Bearer ' + token,
		},
		data: speakUrls,
	});

	const result = res.data.result;
	return result;
};

const read = (actor, text, option = {}) => {
	return new Promise(async (resolve, reject) => {
		const post = await speakPost(actor.actor_id, text, option);
		let audio;

		await sleep(1000);
		do {
			await sleep(300);
			const get = await speakGet(post);
			audio = get[0].audio;
		} while ( !audio );


		const res = await axios({
			url: audio.url + '/no-redirect',
			method: 'get',
			headers: {
				authorization: 'Bearer ' + token,
			},
		});
		
		const wavUrl = res.data.result;
		
		const fname = "typecast-tts-" + new Date().getTime() + new Date().getMilliseconds() + '.wav';
		const writable = fs.createWriteStream(fname);

		try {
			const req = httpReq({ url: wavUrl, method: 'get' }, (err, res, body) => {
				if ( err ) {
					throw Error(err);
				}
			});
			req.pipe(writable);
			writable.on('close', () => {
				const str = fs.readFileSync(fname);
				fs.unlinkSync(fname);
				resolve("data:audio/mp3;base64," + str.toString('base64'));
			});
		} catch(err) {
			console.error(err);
			reject(err);
		}

		/*
		const player = document.querySelector('#sound-player');
		if ( player ) {
			player.src = wavUrl;
			player.play();
		}
		*/
	});
};

const getAccountInfo = async (idToken) => {
	const res = await axios({
		url: 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo',
		method: 'post',
		params: {
			key: fbKey,
		},
		data: {
			idToken,
		},
	});
	const data = res.data;
	if ( data.users.length > 0 ) {
		return data.users[0];
	}
}

const loginAccount = async (email, password) => {
	try {
		const res = await axios({
			url: 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword',
			method: 'post',
			params: {
				key: fbKey,
			},
			data: {
				email,
				password,
				returnSecureToken: true,
			}
		});
		return res.data;
	} catch(err) {
		const res = err.response;
		const error = res.data.error;
		noti.error(`[${error.code}] ${error.message}`);
	}
}

const customToken = async (token) => {
	const res = await axios({
		url: apiUrl + '/auth-fb/custom-token',
		method: 'post',
		data: {
			token,
		},
	});
	const result = res.data.result;
	return result.access_token;
};

const verifyToken = async (token) => {
	const res = await axios({
		url: 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken',
		method: 'post',
		params: {
			key: fbKey,
		},
		data: {
			returnSecureToken: true,
			token,
		},
	});
	return res.data;
};

const initLogin = async (email, password) => {
	const account = await loginAccount(email, password);
	if ( account ) {
		const custom = await customToken(account.idToken);
		const verify = await verifyToken(custom);
		token = verify.idToken;
		gAccount = account;
		return gAccount;
	}
};

const isLogin = () => {
	if ( gAccount ) {
		return true;
	}
	return false;
}

const getLoginAccount = () => {
	return gAccount;
}

module.exports = {
	getVoiceList,
	loginAccount,
	initLogin,
	read,
	isLogin,
	getLoginAccount,
};