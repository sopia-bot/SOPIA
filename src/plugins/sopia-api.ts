import axios from 'axios';
import { UserDto } from '@sopia-bot/api-dto';

export class SopiaAPI {

	public user: any;

	public protocol: string = 'https';
	public host: string = 'api.sopia.dev';

	get ApiURL() {
		return `${this.protocol}://${this.host}`;
	}

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

		data['url'] = this.ApiURL + url;
		data['method'] = method;

		if ( this.user?.token ) {
			data['headers']['authorization'] = 'Bearer ' + this.user.token;
		}

		try {
			const res = await axios(data);
			return res.data;
		} catch (err: any) {
			if ( err.response ) {
				if ( err.response.data.error ) {
					if ( err.response.data.msg === 'jwt_expired' ) {
						await this.refreshToken.call(this);
						return await this.req(method, url, data);
					}
				}
			}
			console.error(err);
		}
	}

	private async refreshToken() {
		const res = await axios({
			url: this.ApiURL + '/auth/refresh',
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
