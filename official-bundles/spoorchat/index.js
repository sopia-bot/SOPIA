/*
 * index.js
 * Created on Fri Jan 28 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
const spoorChat = require('./spoorchat.js');
const GoogleVoice = require('./voice-engine/google.js');

spoorChat.addVoice({
	name: 'minji',
	label: '민지',
	option: {
		languageCode: 'ko-KR',
		name: 'ko-KR-Wavenet-A',
		ssmlGender: 'FEMALE',
	},
	engine: GoogleVoice,
});
spoorChat.addVoice({
	name: 'minjung',
	label: '민정',
	option: {
		languageCode: 'ko-KR',
		name: 'ko-KR-Wavenet-B',
		ssmlGender: 'FEMALE',
	},
	engine: GoogleVoice,
});
spoorChat.addVoice({
	name: 'minsu',
	label: '민수',
	option: {
		languageCode: 'ko-KR',
		name: 'ko-KR-Wavenet-C',
		ssmlGender: 'MALE',
	},
	engine: GoogleVoice,
});
spoorChat.addVoice({
	name: 'minsu',
	label: '민상',
	option: {
		languageCode: 'ko-KR',
		name: 'ko-KR-Wavenet-D',
		ssmlGender: 'MALE',
	},
	engine: GoogleVoice,
});

sopia.itv.add('spootchat', spoorChat.processor, 1000);


sopia.on('live_present', spoorChat.presentEvent);
sopia.on('live_message', spoorChat.chatEvent);
