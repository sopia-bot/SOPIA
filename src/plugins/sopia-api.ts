import axios from 'axios';
import { UserDto } from '@sopia-bot/api-dto';

export class SopiaAPI {

	public user: any;

	private jwt: string = '';
	private readonly host: string = 'http://222.117.116.148:4080';

	public async login(id: string, pw: string) {
		const res = await this.req('POST', '/auth/login/', {
			id,
			pw,
		});

		const user = res.data[0];
		this.jwt = user.token;
		this.user = user;

		return user;
	}

	public async setUserInfo(data: UserDto) {
		return await this.req('PATCH', '/user/info', data);
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

		if ( res.data.error ) {
			throw res.data;
		}

		return res.data;
	}

}
