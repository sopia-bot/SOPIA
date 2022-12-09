/*
 * auth.ts
 * Created on Wed Jun 30 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { SpoonClient } from '../../spoon/';
import {
	HttpRequestWrapper,
	ApiLogin,
	ApiSetPassword,
} from '../';

export class AuthApiWrapper {

	constructor(private _client: SpoonClient) {
	}

	get request() {
		return this._client.api.request;
	}

	async login(req: ApiLogin.Request): HttpRequestWrapper<ApiLogin.Request, ApiLogin.Response> {
		return await this.request<ApiLogin.Request, ApiLogin.Response>(ApiLogin, req);
	}

	async setPassword(req: ApiSetPassword.Request): HttpRequestWrapper<ApiSetPassword.Request, ApiSetPassword.Response> {
		return await this.request<ApiSetPassword.Request, ApiSetPassword.Response>(ApiSetPassword, req);
	}

}
