import axios from 'axios';

export class SopiaAPI {

	private jwt: string = '';
	private readonly host: string = 'http://222.117.116.148:4080';
	public user: any;

	constructor() {
	}

	private async req(method: string, url: string, data: any = {}) {
		if ( !data['headers'] ) {
			data = { data, headers: {} };
		}
		if ( url[0] !== '/' ) {
			url = '/' + url;
		}

		data['url'] = this.host + url;
		data['method'] = method;

		if ( this.jwt ) {
			data['headers']['authorization'] = 'Bearer ' + this.jwt;
		}

		const res = await axios(data);
		return res.data;
	}

	public async login(id: string, pw: string) {
		const res = await this.req('POST', '/auth/login/', {
			id,
			pw,
		});

		if ( res.error ) {
			throw res;
		}

		const user = res.data[0];
		this.jwt = user.token;
		this.user = user;

		return user;
	}

}
