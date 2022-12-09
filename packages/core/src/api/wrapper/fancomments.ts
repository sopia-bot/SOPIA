/*
 * fancomments.ts
 * Created on Wed Jun 30 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { SpoonClient } from '../../spoon/';
import { User } from '../../struct/';
import {
	HttpRequestWrapper,
	ApiModifyFancomments,
	ApiRemoveFancomments,
	ApiBlindFancomments,
	ApiGetFancommentsMessages,
	ApiFancommentsWriteMessages,
	ApiFancommentsModifyMessages,
	ApiFancommentsRemoveMessages,
} from '../';

export class FancommentsApiWrapper {

	constructor(private _client: SpoonClient) {
	}

	get request() {
		return this._client.api.request;
	}

	async modify(comment: number, req: ApiModifyFancomments.Request): HttpRequestWrapper<ApiModifyFancomments.Request, ApiModifyFancomments.Response> {
		return await this.request<ApiModifyFancomments.Request, ApiModifyFancomments.Response>(ApiModifyFancomments, comment, req);
	}

	async remove(comment: number): HttpRequestWrapper<ApiRemoveFancomments.Request, ApiRemoveFancomments.Response> {
		return await this.request<ApiRemoveFancomments.Request, ApiRemoveFancomments.Response>(ApiRemoveFancomments, comment);
	}

	async blind(comment: number, req: ApiBlindFancomments.Request): HttpRequestWrapper<ApiBlindFancomments.Request, ApiBlindFancomments.Response> {
		return await this.request<ApiBlindFancomments.Request, ApiBlindFancomments.Response>(ApiBlindFancomments, comment, req);
	}

	async messages(comment: number): HttpRequestWrapper<ApiGetFancommentsMessages.Request, ApiGetFancommentsMessages.Response> {
		return await this.request<ApiGetFancommentsMessages.Request, ApiGetFancommentsMessages.Response>(ApiGetFancommentsMessages, comment);
	}

	async writeMessages(comment: number, req: ApiFancommentsWriteMessages.Request): HttpRequestWrapper<ApiFancommentsWriteMessages.Request, ApiFancommentsWriteMessages.Response> {
		return await this.request<ApiFancommentsWriteMessages.Request, ApiFancommentsWriteMessages.Response>(ApiFancommentsWriteMessages, comment, req);
	}

	async modifyMessages(comment: number, req: ApiFancommentsModifyMessages.Request): HttpRequestWrapper<ApiFancommentsModifyMessages.Request, ApiFancommentsModifyMessages.Response> {
		return await this.request<ApiFancommentsModifyMessages.Request, ApiFancommentsModifyMessages.Response>(ApiFancommentsModifyMessages, comment, req);
	}

	async removeMessages(comment: number, req: ApiFancommentsRemoveMessages.Request): HttpRequestWrapper<ApiFancommentsRemoveMessages.Request, ApiFancommentsRemoveMessages.Response> {
		return await this.request<ApiFancommentsRemoveMessages.Request, ApiFancommentsRemoveMessages.Response>(ApiFancommentsRemoveMessages, comment, req);
	}

}
