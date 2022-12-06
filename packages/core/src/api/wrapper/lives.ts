/*
 * lives.ts
 * Created on Wed Jun 30 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { SpoonClient } from '../../spoon/';
import { LiveInfo } from '../../struct/';
import {
	HttpRequestWrapper,
	ApiLivesRequestConfig,
	ApiLivesInfo,
	ApiLivesListeners,
	ApiLivesListenersFans,
	ApiLivesSponsor,
	ApiLivesLike,
	ApiLivesSetLike,
	ApiLivesToken,
	ApiLivesAccess,
	ApiLivesBanner,
	ApiLivesPopular,
	ApiLivesSubscribed,
	ApiLivesSetManager,
	ApiLivesBlock,
	ApiLivesPresent,
	ApiLivesClose,
	ApiLivesUpdate,
	ApiLivesCreate,
} from '../';

type LiveId = number|LiveInfo;

export class LivesApiWrapper {

	constructor(private _client: SpoonClient) {
	}

	get request() {
		return this._client.api.request;
	}

	private _liveId(l: LiveId): number {
		return typeof l === 'number' ? l : l.id;
	}

	async banner(): HttpRequestWrapper<ApiLivesBanner.Request, ApiLivesBanner.Response> {
		return await this.request<ApiLivesBanner.Request, ApiLivesBanner.Response>(ApiLivesBanner);
	}

	async popular(): HttpRequestWrapper<ApiLivesPopular.Request, ApiLivesPopular.Response> {
		return await this.request<ApiLivesPopular.Request, ApiLivesPopular.Response>(ApiLivesPopular);
	}

	async subscribed(): HttpRequestWrapper<ApiLivesSubscribed.Request, ApiLivesSubscribed.Response> {
		return await this.request<ApiLivesSubscribed.Request, ApiLivesSubscribed.Response>(ApiLivesSubscribed);
	}

	async info(live: LiveId, req?: ApiLivesRequestConfig): HttpRequestWrapper<ApiLivesInfo.Request, ApiLivesInfo.Response> {
		return await this.request<ApiLivesInfo.Request, ApiLivesInfo.Response>(ApiLivesInfo, this._liveId(live), req);
	}

	async listeners(live: LiveId, req?: ApiLivesRequestConfig): HttpRequestWrapper<ApiLivesListeners.Request, ApiLivesListeners.Response> {
		return await this.request<ApiLivesListeners.Request, ApiLivesListeners.Response>(ApiLivesListeners, this._liveId(live), req);
	}

	async listenersFans(live: LiveId, req?: ApiLivesRequestConfig): HttpRequestWrapper<ApiLivesListenersFans.Request, ApiLivesListenersFans.Response> {
		return await this.request<ApiLivesListenersFans.Request, ApiLivesListenersFans.Response>(ApiLivesListenersFans, this._liveId(live), req);
	}

	async sponsor(live: LiveId, req?: ApiLivesRequestConfig): HttpRequestWrapper<ApiLivesSponsor.Request, ApiLivesSponsor.Response> {
		return await this.request<ApiLivesSponsor.Request, ApiLivesSponsor.Response>(ApiLivesSponsor, this._liveId(live), req);
	}

	async like(live: LiveId, req?: ApiLivesRequestConfig): HttpRequestWrapper<ApiLivesLike.Request, ApiLivesLike.Response> {
		return await this.request<ApiLivesLike.Request, ApiLivesLike.Response>(ApiLivesLike, this._liveId(live), req);
	}

	async setLike(live: LiveId, req?: ApiLivesRequestConfig): HttpRequestWrapper<ApiLivesSetLike.Request, ApiLivesSetLike.Response> {
		return await this.request<ApiLivesSetLike.Request, ApiLivesSetLike.Response>(ApiLivesSetLike, this._liveId(live), req);
	}

	async token(live: LiveId, req: ApiLivesToken.Request): HttpRequestWrapper<ApiLivesToken.Request, ApiLivesToken.Response> {
		return await this.request<ApiLivesToken.Request, ApiLivesToken.Response>(ApiLivesToken, this._liveId(live), req);
	}

	async access(live: LiveId, req?: ApiLivesRequestConfig): HttpRequestWrapper<ApiLivesAccess.Request, ApiLivesAccess.Response> {
		return await this.request<ApiLivesAccess.Request, ApiLivesAccess.Response>(ApiLivesAccess, this._liveId(live), req);
	}

	async setManager(live: LiveId, req: ApiLivesSetManager.Request): HttpRequestWrapper<ApiLivesSetManager.Request, ApiLivesSetManager.Response> {
		return await this.request<ApiLivesSetManager.Request, ApiLivesSetManager.Response>(ApiLivesSetManager, this._liveId(live), req);
	}

	async block(live: LiveId, req: ApiLivesBlock.Request): HttpRequestWrapper<ApiLivesBlock.Request, ApiLivesBlock.Response> {
		return await this.request<ApiLivesBlock.Request, ApiLivesBlock.Response>(ApiLivesBlock, this._liveId(live), req);
	}

	async close(live: LiveId, req: ApiLivesClose.Request): HttpRequestWrapper<ApiLivesClose.Request, ApiLivesClose.Response> {
		return await this.request<ApiLivesClose.Request, ApiLivesClose.Response>(ApiLivesClose, this._liveId(live), req);
	}

	async present(live: LiveId, req: ApiLivesPresent.Request): HttpRequestWrapper<ApiLivesPresent.Request, ApiLivesPresent.Response> {
		return await this.request<ApiLivesPresent.Request, ApiLivesPresent.Response>(ApiLivesPresent, this._liveId(live), req);
	}

	async update(live: LiveId, req: ApiLivesUpdate.Request): HttpRequestWrapper<ApiLivesUpdate.Request, ApiLivesUpdate.Response> {
		return await this.request<ApiLivesUpdate.Request, ApiLivesUpdate.Response>(ApiLivesUpdate, this._liveId(live), req);
	}

	async create(req: ApiLivesCreate.Request): HttpRequestWrapper<ApiLivesCreate.Request, ApiLivesCreate.Response> {
		return await this.request<ApiLivesCreate.Request, ApiLivesCreate.Response>(ApiLivesCreate, req);
	}

}
