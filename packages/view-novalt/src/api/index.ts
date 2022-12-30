import axios from 'axios';
import { SopiaApiClient } from './client';
import { UserApi, User } from './user';
import { AuthApi } from './auth';
import { UtilApi } from './util';
import { ContentApi } from './content';

export class SopiaAPI implements SopiaApiClient {

	public logonUser!: User;

	public protocol: string = 'https';
	public host: string = 'api.sopia.dev';

	public auth: AuthApi = new AuthApi(this);
	public user: UserApi = new UserApi(this);
	public util: UtilApi = new UtilApi(this);
	public content: ContentApi = new ContentApi(this);

	get ApiURL() {
		return `${this.protocol}://${this.host}`;
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

		if ( this.logonUser?.token ) {
			data['headers']['authorization'] = 'Bearer ' + this.logonUser.token;
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
			throw err;
		}
	}

	private async refreshToken() {
		const res = await axios({
			url: this.ApiURL + '/auth/refresh',
			method: 'post',
			data: {
				refresh_token: this.logonUser.refresh_token,
			},
		});
		if ( res.data.error ) {
			switch ( res.data.msg ) {
				case 'expired':
					//window.logout();
					return;
			}
		}
		this.logonUser.token = res.data.data[0].token;
		this.logonUser.refresh_token = res.data.data[0].refresh_token;

		//window.appCfg.set('auth.sopia', this.user);
		//window.appCfg.save();
	}

}

const api = new SopiaAPI();

export function useSopiaAPI(): SopiaAPI {
	return api;
}