/*
 * index.js
 * Created on Mon May 03 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

httpReq = require('request');
sopia.nara = require('./config.json');
sopia.nara.api = {
	id: '',
	key: '',
};
sopia.nara.bgm = {};
sopia.nara.cache = require('./nara.json');


playMusic = (src, volume = 0.5) => {
    return new Promise((res, rej) => {
        if ( !fs.existsSync(src) ) {
            rej(new Error('No have file.'));
            return;
        }

        const name = path.basename(src, path.extname(src));
        sopia.nara.bgm[name] = new Audio(src);
        sopia.nara.bgm[name].onpause = () => {
            sopia.nara.bgm[name].remove();
            delete sopia.nara.bgm[name];
            res();
        };
        sopia.nara.bgm[name].volume = volume;
        sopia.nara.bgm[name].play();
    });
};

speechNara = (text) => new Promise((resolve, reject) => {
	text = text.replace(/[^가-힣|ㄱ-ㅎ|ㅏ-ㅣ|a-z|A-Z|0-9| ]/g, '');
	cfname = text.replace(/ /g, '');

	if ( !fs.existsSync('./tmp/') ) {
		fs.mkdirSync('./tmp/');
	}

	if ( sopia.nara.cache[cfname] ) {
		playMusic(sopia.nara.cache[cfname], sopia.nara.volumn)
		.then(resolve);
		return;
	}

	const options = {
		url: 'https://naveropenapi.apigw.ntruss.com/voice-premium/v1/tts',
		method: 'post',
		form: {
			speaker: 'clova',
			speed: '0',
			text,
		},
		headers: {
			'X-NCP-APIGW-API-KEY-ID': sopia.nara.api.id,
			'X-NCP-APIGW-API-KEY': sopia.nara.api.key,
		},
	};

	const fname = "./tmp/clova-tts-" + new Date().getTime() + new Date().getMilliseconds() + '.mp3';
	const writable = fs.createWriteStream(fname);

	try {
		const req = httpReq(options, (err, res, body) => {
			if ( err ) {
				reject(err);
			}
		});
		req.pipe(writable);
	} catch(err) {
		console.error(err);
		reject(err);
	}
	writable.on('close', () => {
		sopia.nara.cache[cfname] = fname;
		fs.writeFile('./nara.json', JSON.stringify(sopia.nara.cache), 'utf8', () => {});
		playMusic(fname, sopia.nara.volumn)
		.then(resolve);
	});
});


/*
 * 해당 API키를 가져가 사용하는 것은 금지합니다.
 * 무시하고 사용했을 시 생기는 불이익은 책임지지 않습니다.
 *
 * Don't use this api key at another source.
 */
httpReq({
	url: 'https://sopia-bot.firebaseio.com/app/nara.json',
	method: 'get',
}, (err, res, body) => {
	sopia.nara.api = JSON.parse(body);
});
