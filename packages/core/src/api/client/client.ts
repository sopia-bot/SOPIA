/*
 * api-client.ts
 * Created on Fri May 14 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { SpoonClient } from '../../spoon/';
import { HttpRequest } from './request';
import {
	LivesApiWrapper,
	UsersApiWrapper,
	FancommentsApiWrapper,
	AuthApiWrapper,
	PlayApiWrapper,
	SearchApiWrapper,
	TastesApiWrapper,
	CommonApiWrapper,
} from '../wrapper/';


export class ApiClient {

	private API_DEBUG: boolean = false;

	public lives: LivesApiWrapper;
	public users: UsersApiWrapper;
	public fancomments: FancommentsApiWrapper;
	public auth: AuthApiWrapper;
	public play: PlayApiWrapper;
	public search: SearchApiWrapper;
	public tastes: TastesApiWrapper;
	public commons: CommonApiWrapper;

	constructor(private _client: SpoonClient) {
		this.lives = new LivesApiWrapper(this._client);
		this.users = new UsersApiWrapper(this._client);
		this.fancomments = new FancommentsApiWrapper(this._client);
		this.auth = new AuthApiWrapper(this._client);
		this.play = new PlayApiWrapper(this._client);
		this.search = new SearchApiWrapper(this._client);
		this.tastes = new TastesApiWrapper(this._client);
		this.commons = new CommonApiWrapper(this._client);
		this.request = this.request.bind(this);
	}

	private createRequestUrl(api: any, id: number) {
		return `${this._client.urls.api}${api.url.replace(/^\//, '').replace('0000', id.toString())}`;
	}

	async request<Req, Res extends any>(api: any, id?: (number|Req), config?: Req): Promise<HttpRequest<Req, Res>> {
		if ( typeof id === 'number' ) {
			// empty
		} else {
			config = id as Req;
			id = 0;
		}

		const req = new HttpRequest<Req, Res>(this._client, api, config || {} as Req);

		req.url = this.createRequestUrl(api, id);
		req.method = api.method;
		if ( this._client.token ) {
			req.headers['Authorization'] = 'Bearer ' + this._client.token;
		}
		req.debug = !!api.debug || this.API_DEBUG;

		const res = await req.send();

		return req;
	}

	async profileImgUpload(data: Buffer): Promise<string> {
		const req = await this.commons.profileUrl();
		const [{ image }] = req.res.results;

		const res = await HttpRequest.Run(this._client, {
			url: image.url,
			method: 'PUT',
			headers: {
				'Content-Type': image.content_type,
			},
			data,
		});

		return image.key;
	}

	async castImgUpload(data: Buffer): Promise<string> {
		const req = await this.commons.castUrl();
		const [{ image }] = req.res.results;

		const res = await HttpRequest.Run(this._client, {
			url: image.url,
			method: 'PUT',
			headers: {
				'Content-Type': image.content_type,
			},
			data,
		});

		return image.key;
	}

}
