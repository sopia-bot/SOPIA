/*
 * index.js
 * Created on Fri Jan 28 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import spoorChat from './spoorchat.js';
import GoogleVoice from './voice-engine/google.js';
import KakaoVoice from './voice-engine/kakao.js';

/* S: GOOGLE */
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
	name: 'minsang',
	label: '민상',
	option: {
		languageCode: 'ko-KR',
		name: 'ko-KR-Wavenet-D',
		ssmlGender: 'MALE',
	},
	engine: GoogleVoice,
});
/* E: GOOGLE */

/* S: KAKAO */
spoorChat.addVoice({
	name: 'spring',
	label: '봄',
	option: {
		voice: 'WOMAN_READ_CALM',
	},
	engine: KakaoVoice,
});
spoorChat.addVoice({
	name: 'ryan',
	label: '라이언',
	option: {
		voice: 'MAN_READ_CALM',
	},
	engine: KakaoVoice,
});
spoorChat.addVoice({
	name: 'naomi',
	label: '나오미',
	option: {
		voice: 'WOMAN_DIALOG_BRIGHT',
	},
	engine: KakaoVoice,
});
spoorChat.addVoice({
	name: 'nick',
	label: '닉',
	option: {
		voice: 'MAN_DIALOG_BRIGHT',
	},
	engine: KakaoVoice,
});
/* E: KAKAO */

const sopia = window.bctx.get('spoorchat');
sopia.itv.add('spootchat', spoorChat.processor, 1000);


exports.live_present = spoorChat.presentEvent;
exports.live_message = spoorChat.chatEvent;
