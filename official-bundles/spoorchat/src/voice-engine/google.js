/*
 * google.js
 * Created on Fri Feb 11 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

const axios = window.require('axios');
const API_KEY = atob('QUl6YVN5REZPNTMyWUh5Ykl0amkxaTdaaGhEUVdEV0NpcjNrUkZZ');

export default async function(text, option) {
	if ( !text ) {
		return '';
	}
	const res = await axios({
		url: `https://texttospeech.googleapis.com/v1/text:synthesize`,
		params: {
			key: API_KEY,
			alt: 'json',
		},
		method: 'post',
		data: {
			"input": {
				text,
			},
			"voice": option,
			"audioConfig": {
				"audioEncoding": 'MP3',
			},
		},
	});

	return res.data.audioContent.toString('base64');
}
