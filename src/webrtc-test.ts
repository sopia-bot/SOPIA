import { SpoonClient, WebSocketManager } from '@sopia-bot/core';
import axios from 'axios';
import * as uuid from 'uuid';

const token = (t: string) => JSON.parse(
	Buffer.from(t.split('.')[1], 'base64')
		.toString('utf8'),
);

export default async function (sopia: SpoonClient) {
	const req = await sopia.api.lives.info(29513042);
	const live = req.res.results[0];
	const sock = await live.join();
	const url = sopia.urls.singApi + '/v1/session/create';
	const { sub: tag } = token(sopia.logonUser.token);
	const { id: rtk } = token(live.room_token);

	console.log(sopia.urls);

	const data = {
		type: 'create',
		tag: tag.toString(),
		dup: 1,
		expd: 7200,
		kcnt: 10,
		rtk,
		pt: 'sndrecv',
		st: 'web/v1.55.0',
		iow: false,
		ua: navigator.userAgent,
		v: 'v0.5.1.24',
		tx: uuid.v4(),
	};

	const res = await axios({
		url,
		method: 'post',
		data,
	});

	const ws = new WebSocket(sopia.urls.singSocket + '/ws/' + res.data.response);
	ws.onmessage = (...args) => {
		console.log(args);
	};

	// ws 패키지를 사용하여 origin 을 https://spooncast.net 으로 변경해야함
}
