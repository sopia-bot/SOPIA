const projectId='silken-avatar-268104';
const keyfile='./sopia-tts.json';
const { ipcMain, ipcRenderer } = require('electron');

let client = null;

Buffer.prototype.toB64Str = function() {
	let buf = this;
	return "data:audio/mp3;base64," + buf.toString('base64');
};

const voices = {
    "minji": {languageCode: 'ko-KR', name: 'ko-KR-Wavenet-A', ssmlGender: 'FEMALE'},
    "minjung": {languageCode: 'ko-KR', name: 'ko-KR-Wavenet-B', ssmlGender: 'FEMALE'},
    "minsu": {languageCode: 'ko-KR', name: 'ko-KR-Wavenet-C', ssmlGender: 'MALE'},
    "minsang": {languageCode: 'ko-KR', name: 'ko-KR-Wavenet-D', ssmlGender: 'MALE'}
};


const StrToSpeech = (str, type = "minji") => {
	return new Promise((resolve, reject) => {
		if ( !str ) reject(new Error('str is undefined'));

		if ( type === "random" ) {
			let voiceList = Object.keys(voices);
			let idx = Math.floor(Math.random() * (voiceList.length));

			type = voiceList[idx];
		}

		const request = {
			input: { text: str },
			voice: voices[type],
			audioConfig: {audioEncoding: 'MP3'},
		};

		client.synthesizeSpeech(request, (err, response) => {	
			if (err) {		
				reject(err);
			}
			resolve(response.audioContent.toB64Str());
		});
	});
};

const tts = (text, type) => {
	return new Promise((resolve, reject) => {
		ipcRenderer.once('text-to-speech-res', (event, res) => {
			if ( res.result === 'success' ) {
				resolve(res.data);
			} else {
				reject(res.data);
			}
		});
		ipcRenderer.send('text-to-speech-req', { text, type });
	});
};

const mainInit = () => {
	let isBrowser = typeof window !== 'undefined';
	if ( !isBrowser ) {
		const textToSpeech = require('@google-cloud/text-to-speech');
		client = new textToSpeech.TextToSpeechClient({
			projectId:projectId,
			keyFilename: keyfile,
		});

		ipcMain.on('text-to-speech-req', (event, options) => {
			StrToSpeech(options.text, options.type).
				then(b64Audio => {
					event.reply('text-to-speech-res', { result: 'success', data: b64Audio });
				}).
				catch(err => {
					event.reply('text-to-speech-res', { result: 'fail', data: err });
				});
		});
	}
};

module.exports = {
	init: mainInit,
	tts,
};
