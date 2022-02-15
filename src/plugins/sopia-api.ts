import axios from 'axios';
import { UserDto } from '@sopia-bot/api-dto';

export class SopiaAPI {

	public user: any;

	private readonly host: string = 'http://222.117.116.148:4080';

	public async login(id: string, pw: string) {
		const res = await this.req('POST', '/auth/login/', {
			id,
			pw,
		});

		const user = res.data[0];
		this.user = user;

		return user;
	}

	public async setUserInfo(data: UserDto) {
		return await this.req('PATCH', '/user/info', data);
	}

	public async req(method: string, url: string, data: any = {}): Promise<any> {
		if ( !data['headers'] ) {
			data = { data, headers: {} };
		}
		if ( url[0] !== '/' ) {
			url = '/' + url;
		}

		data['url'] = this.host + url;
		data['method'] = method;

		if ( this.user?.token ) {
			data['headers']['authorization'] = 'Bearer ' + this.user.token;
		}

		try {
			const res = await axios(data);
			return res.data;
		} catch (err) {
			if ( err.response ) {
				const res = err.response.data as any;
				if ( res.msg === 'jwt_expired' ) {
					await this.refreshToken.call(this);
					return await this.req(method, url, data);
				}
			}
		}
	}

	private async refreshToken() {
		const res = await axios({
			url: this.host + '/auth/refresh',
			method: 'post',
			data: {
				refresh_token: this.user.refresh_token,
			},
		});
		this.user.token = res.data.data[0].token;
		this.user.refresh_token = res.data.data[0].refresh_token;

		window.appCfg.set('auth.sopia', this.user);
		window.appCfg.save();
	}

}
