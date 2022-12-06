/*
 * search.ts
 * Created on Wed Jun 30 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { SpoonClient } from '../../spoon/';
import { Live, User, Cast } from '../../struct/';
import {
	HttpRequestWrapper,
	ApiSearchContent,
	ApiSearchUser,
} from '../';

export type ApiContentReq<R> = HttpRequestWrapper<ApiSearchContent.Request, R>;
export type ContentResponse = ApiSearchContent.LiveResponse | ApiSearchContent.CastResponse;

export class SearchApiWrapper {

	constructor(private _client: SpoonClient) {
	}

	get request() {
		return this._client.api.request;
	}

	async content<T extends ContentResponse>(req: ApiSearchContent.Request): ApiContentReq<T> {
		return await this.request<ApiSearchContent.Request, T>(ApiSearchContent, req);
	}

	async user(req: ApiSearchUser.Request): HttpRequestWrapper<ApiSearchUser.Request, ApiSearchUser.Response> {
		return await this.request<ApiSearchUser.Request, ApiSearchUser.Response>(ApiSearchUser, req);
	}

}
