
const axios = window.axios;
const API_KEY = atob('S2FrYW9BSyA3YjJmNzY2ZTIwZDI4NWY3YmQ3MzA2OWVjNTIwYjI5Mg');

/*
option: {
	voice: string
}
*/
export default async function(text, option) {
	if ( !text ) {
		return '';
	}

	const res = await axios({
		url: 'https://kakaoi-newtone-openapi.kakao.com/v1/synthesize',
		method: 'post',
		data: `<speak><voice name="${option.voice}">${text}</voice></speak>`,
		headers: {
			'Content-Type': 'application/xml',
			'Authorization': API_KEY,
		},
		responseType: 'arraybuffer',
	});

	console.log('kakao', res);

	return Buffer.from(res.data, 'binary').toString('base64');
}