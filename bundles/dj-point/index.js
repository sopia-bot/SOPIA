/*
 * index.js
 * Created on Tue Sep 07 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

soipa.point.guests = {};
sopia.point.req = (method, url, options = {}) => {
	const host = 'https://sopia-bot.firebaseio.com';
	const u = path.join('/app/points/', url) + '.json';

	options.method = method;
	options.url = u;

	return axios(options);
};

sopia.point.event = (e) => {

};

console.log('use do not running?');

sopia.off('all', sopia.point.event);
sopia.once('join', (e) => {
	if ( !sopia.live ) {
		sopia.live = e.live;
	}

	try {
		sopia.point.req('GET', sopia.live.author.id)
			.then((res) => {
				sopia.point.guests = res.data;
				sopia.on('all', sopia.point.event);
			});
	} catch(err) {
		// 할 건 없으니 내거라도 세팅을...
		sopia.point.req('PUT', sopia.live.author.id, {
			data: {
				'7229838': 0,
			},
		});
	}
});
