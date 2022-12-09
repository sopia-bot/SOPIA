/*
 * users.ts
 * Created on Wed Jun 30 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { SpoonClient } from '../../spoon/';
import { UserSearchProfile } from '../../struct/';
import {
	HttpRequestWrapper,
	ApiUsersBlock,
	ApiUsersUnBlock,
	ApiUsersFollow,
	ApiUsersUnFollow,
	ApiUsersFollowings,
	ApiUsersFollowers,
	ApiUsersInfo,
	ApiSetUsersInfo,
	ApiUsersMiniProfile,
	ApiUsersUsername,
	ApiUsersSetUsername,
	ApiUsersVoice,
	ApiUsersCasts,
	ApiUsersFanmessages,
	ApiUsersWriteFanmessages,
	ApiUsersLive,
} from '../';

type UserId = number|UserSearchProfile;

export class UsersApiWrapper {

	constructor(private _client: SpoonClient) {
	}

	get request() {
		return this._client.api.request;
	}

	private _userId(u: UserId): number {
		return u instanceof UserSearchProfile ? u.id : u;
	}

	async block(user: UserId): HttpRequestWrapper<ApiUsersBlock.Request, ApiUsersBlock.Response> {
		return await this.request<ApiUsersBlock.Request, ApiUsersBlock.Response>(ApiUsersBlock, this._userId(user));
	}

	async unblock(user: UserId): HttpRequestWrapper<ApiUsersUnBlock.Request, ApiUsersUnBlock.Response> {
		return await this.request<ApiUsersUnBlock.Request, ApiUsersUnBlock.Response>(ApiUsersUnBlock, this._userId(user));
	}

	async follow(user: UserId): HttpRequestWrapper<ApiUsersFollow.Request, ApiUsersFollow.Response> {
		return await this.request<ApiUsersFollow.Request, ApiUsersFollow.Response>(ApiUsersFollow, this._userId(user));
	}

	async unfollow(user: UserId): HttpRequestWrapper<ApiUsersUnFollow.Request, ApiUsersUnFollow.Response> {
		return await this.request<ApiUsersUnFollow.Request, ApiUsersUnFollow.Response>(ApiUsersUnFollow, this._userId(user));
	}

	async followings(user: UserId): HttpRequestWrapper<ApiUsersFollowings.Request, ApiUsersFollowings.Response> {
		return await this.request<ApiUsersFollowings.Request, ApiUsersFollowings.Response>(ApiUsersFollowings, this._userId(user));
	}

	async followers(user: UserId): HttpRequestWrapper<ApiUsersFollowers.Request, ApiUsersFollowers.Response> {
		return await this.request<ApiUsersFollowers.Request, ApiUsersFollowers.Response>(ApiUsersFollowers, this._userId(user));
	}

	async info(user: UserId): HttpRequestWrapper<ApiUsersInfo.Request, ApiUsersInfo.Response> {
		return await this.request<ApiUsersInfo.Request, ApiUsersInfo.Response>(ApiUsersInfo, this._userId(user));
	}

	async setInfo(user: UserId, req: ApiSetUsersInfo.Request): HttpRequestWrapper<ApiSetUsersInfo.Request, ApiSetUsersInfo.Response> {
		return await this.request<ApiSetUsersInfo.Request, ApiSetUsersInfo.Response>(ApiSetUsersInfo, this._userId(user), req);
	}

	async miniProfile(user: UserId): HttpRequestWrapper<ApiUsersMiniProfile.Request, ApiUsersMiniProfile.Response> {
		return await this.request<ApiUsersMiniProfile.Request, ApiUsersMiniProfile.Response>(ApiUsersMiniProfile, this._userId(user));
	}

	async username(req: ApiUsersUsername.Request): HttpRequestWrapper<ApiUsersUsername.Request, ApiUsersUsername.Response> {
		return await this.request<ApiUsersUsername.Request, ApiUsersUsername.Response>(ApiUsersUsername, req);
	}

	async setUsername(req: ApiUsersSetUsername.Request): HttpRequestWrapper<ApiUsersSetUsername.Request, ApiUsersSetUsername.Response> {
		return await this.request<ApiUsersSetUsername.Request, ApiUsersSetUsername.Response>(ApiUsersSetUsername, req);
	}

	async voice(user: UserId): HttpRequestWrapper<ApiUsersVoice.Request, ApiUsersVoice.Response> {
		return await this.request<ApiUsersVoice.Request, ApiUsersVoice.Response>(ApiUsersVoice, this._userId(user));
	}

	async casts(user: UserId, req: ApiUsersCasts.Request): HttpRequestWrapper<ApiUsersCasts.Request, ApiUsersCasts.Response> {
		return await this.request<ApiUsersCasts.Request, ApiUsersCasts.Response>(ApiUsersCasts, this._userId(user), req);
	}

	async fanmessages(user: UserId): HttpRequestWrapper<ApiUsersFanmessages.Request, ApiUsersFanmessages.Response> {
		return await this.request<ApiUsersFanmessages.Request, ApiUsersFanmessages.Response>(ApiUsersFanmessages, this._userId(user));
	}

	async writeFanmessages(user: UserId, req: ApiUsersWriteFanmessages.Request): HttpRequestWrapper<ApiUsersWriteFanmessages.Request, ApiUsersWriteFanmessages.Response> {
		return await this.request<ApiUsersWriteFanmessages.Request, ApiUsersWriteFanmessages.Response>(ApiUsersWriteFanmessages, this._userId(user), req);
	}

	async live(user: UserId): HttpRequestWrapper<ApiUsersLive.Request, ApiUsersLive.Response> {
		return await this.request<ApiUsersLive.Request, ApiUsersLive.Response>(ApiUsersLive, this._userId(user));
	}

}
