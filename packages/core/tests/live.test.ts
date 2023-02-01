import { spawn } from 'child_process';
import {
	SpoonClient,
	SnsType,
	Country,
} from '../src/';
import fs from 'fs';

const id = process.env['phone'] as string;
const pw = process.env['pw'] as string;
const file = process.env['file'] as string;
const ffmpegPath = process.env['ffmpeg'] as string;
const phone = parseInt(id, 10);

console.log(phone, pw);

(async () => {
	const spoon = new SpoonClient('deviceUUID');
	spoon.country = Country.KOREA;
	
	let rtmpUrl = '';
	await spoon.init();
	await spoon.login(phone, pw, SnsType.PHONE);
	const req = await spoon.api.lives.create({
		data: {
			is_adult: false,
			is_save: false,
			donation: 0,
			title: '테스트 방송',
			type: 0,
			welcome_message: 'test live',
			invite_member_ids: [],
			tags: ['태', '그', '가', '여', '러', '개', '지', '요'],
			categories: ['daily'],
			engine: { name: 'sori', host: '' },
			is_live_call: false,
			device_unique_id: spoon.deviceUUID,
			spoon_aim: [],
		},
	});
	
	const [live] = req.res.results;
	
	live.initLiveEngine();
	rtmpUrl = await live.liveEngine.publish();
	
	const ffmpeg = spawn(
		ffmpegPath,
		[
			'-re',
			'-f', 'mp3',
			'-i', '-',
			'-c:v', 'libx264',
			'-c:a', 'aac',
			'-vn',
			'-strict', 'experimental',
			'-f', 'flv', rtmpUrl,
		]
	);

	live.join();
	
	const stream = fs.createReadStream(file);
	console.log('read', file);
	stream.on('readable', () => {
		let chunk;
		let i = 0;
		while ( chunk = stream.read() ) {
			console.log('write', i++);
			ffmpeg.stdin.write(chunk);
		}
	});

	const stream2 = fs.createReadStream('/home/youn/다운로드/sound2.mp3');
	stream2.on('readable', () => {
		let chunk;
		let i = 0;
		while ( chunk = stream2.read() ) {
			console.log('write', i++);
			ffmpeg.stdin.write(chunk);
		}
	});
})();