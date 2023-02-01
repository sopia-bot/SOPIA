/*
 * index.ts
 * Created on Fri Jun 25 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { Country, CountryNumber, SnsType } from '../../enum/';
import { LogonUser, LiveInfo, UserSearchProfile } from '../../struct/';
import { ApiClient, ApiLogin, ApiUrls, HttpRequest } from '../../api/';
import { StickerClient } from '../../sticker/';
import { EventEmitter } from '../../utils/';

export type UserAgent = 'Web'|'Android'|'iOS';

export class SpoonClient {

	public country: Country = Country.KOREA;
	public urls!: ApiUrls;
	public token: string = '';
	public appVersion: string = '7.9.8';
	public userAgent: UserAgent = 'Web';
	public refToken: string = '';
	public logonUser!: LogonUser;

	public api: ApiClient;
	public sticker: StickerClient;

	public liveMap: Map<number, LiveInfo> = new Map();
	public hook: EventEmitter = new EventEmitter();

	constructor(public deviceUUID: string) {
		this.api = new ApiClient(this);
		this.sticker = new StickerClient(this);
	}

	async init() {
		await this.initUrlsInfo();
		await this.sticker.initSticker();
	}

	async initUrlsInfo() {
		const res = await HttpRequest.Run<ApiUrls>(this, {
			url: `https://www.spooncast.net/config/api/${this.country}.json?ts=${Date.now()}`,
			method: 'get',
		});
		this.urls = res;

		if ( !this.urls.auth ) {
			this.urls.auth = `https://${this.country}-auth.spooncast.net/`;
		}

		return this.urls;
	}

	async initToken(sns_id: (number|string), password: string, sns_type: SnsType) {
		const code = CountryNumber[this.country.toUpperCase()];
		const reqUrl = `${this.urls.auth}tokens/`;

		const res = await HttpRequest.Run<any>(this, {
			url: reqUrl,
			method: 'post',
			data: {
				device_unique_id: this.deviceUUID,
				auth_data: {
					act_type: sns_type,
					password,
					msisdn: Number(code + sns_id),
				},
			},
		});

		if ( res && res.data ) {
			this.token = res.data.jwt;
			this.refToken = res.data.refresh_token;
		} else if ( res && res.error ) {
			throw res;
		}

		return this.token;
	}

	async refreshToken(userId?: (number|string), token?: string, refToken?: string) {
		const reqUrl = `${this.urls.auth}tokens/`;

		try {
			const res = await HttpRequest.Run<any>(this, {
				url: reqUrl,
				method: 'put',
				headers: {
					authorization: 'Bearer ' + (token || this.token)
				},
				data: {
					device_unique_id: this.deviceUUID,
					refresh_token: refToken || this.refToken,
					user_id: userId || this.logonUser.id,
				},
			});
			if ( res && res.data ) {
				this.token = res.data.jwt;
				this.refToken = refToken || this.refToken;
			}
		} catch(err) {
			console.log(err.toJSON());
		}

		return this.token;
	}

	async login(sns_id: (number|string), password: string, sns_type: SnsType): Promise<LogonUser> {
		await this.initToken(sns_id, password, sns_type);

		const req = await this.api.auth.login({
			'data': {
				sns_type,
				sns_id,
				password,
				country: this.country,
			},
		});
		this.logonUser = req.res.results[0];
		this.logonUser.token = this.token;
		this.logonUser.refresh_token = this.refToken;

		return this.logonUser;
	}

	async loginToken(user: (UserSearchProfile|number), token: string, refToken: string = '', rigidity: boolean = false): Promise<LogonUser> {
		const req = await this.api.users.info(user);
		this.logonUser = req.res.results[0] as LogonUser;

		const jwt = token.split('.');
		const payload: any = JSON.parse(
			Buffer.from(jwt[1], 'base64')
				.toString('utf8')
		);

		if ( payload.did ) {
			this.deviceUUID = payload.did;
		}

		this.token = token;
		this.logonUser.token = this.token;
		if ( refToken ) {
			try {
				await this.refreshToken(this.logonUser.id, token, refToken);
				this.logonUser.refresh_token = this.refToken;
			} catch (err) {
				if ( rigidity ) {
					throw err;
				}
			}
		}

		return this.logonUser;
	}

	snsLoginURL(sns_type: SnsType): string {
		// should parsing localStorage.getItem('SPOONCAST_requestBySnsLogin')
		return `https://www.spooncast.net/${this.country}/oauth/authorize?sns_type=${sns_type}&is_jwt=true&is_agree=0&ts=${new Date().getTime()}`;
	}

}
