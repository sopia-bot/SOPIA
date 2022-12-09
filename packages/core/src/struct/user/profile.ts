/*
 * profile.ts
 * Created on Thu Apr 29 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import {
	Grants,
	Budget,
	Country,
	PushSettings,
	ServiceAgreement,
	Tier
} from '../../enum/';
import { FanboardInfo } from '../fanboard/info';
import { SpoonSession } from '../';
import { CurrentLive } from '../live/current-live';
import { Serializable, JsonProperty, deserialize } from 'typescript-json-serializer';

@Serializable()
export class UserSearchProfile extends SpoonSession {

	@JsonProperty({
		name: 'current_live',
		type: CurrentLive,
		beforeDeserialize: (value: any, instance: any) => {
			value['_client'] = instance._client;
			return value;
		},
	}) current_live!: CurrentLive;

	@JsonProperty() current_live_id!: number;

	@JsonProperty() id!: number;

	@JsonProperty() is_active!: boolean;

	@JsonProperty() is_live!: boolean;

	@JsonProperty() is_verified!: boolean;

	@JsonProperty() is_vip!: boolean;

	@JsonProperty() nickname!: string;

	@JsonProperty() profile_url!: string;

	@JsonProperty() status!: number; // live on 1 is not 0

	@JsonProperty() tag!: string;

	@JsonProperty() tier!: Tier;

	async follow() {
		return await this._api.users.follow(this);
	}

	async unfollow() {
		return await this._api.users.unfollow(this);
	}

	async followings() {
		return await this._api.users.followings(this);
	}

	async followers() {
		return await this._api.users.followers(this);
	}

	async block() {
		return await this._api.users.block(this);
	}

	async unblock() {
		return await this._api.users.unblock(this);
	}

	async info() {
		return await this._api.users.info(this);
	}

	async voice() {
		return await this._api.users.voice(this);
	}

	async casts(type: number) {
		return await this._api.users.casts(this, {
			'params': {
				type,
			},
		});
	}

	async fanmessages() {
		return await this._api.users.fanmessages(this);
	}

	async writeFanmessages(contents: string) {
		return await this._api.users.writeFanmessages(this, {
			'data': {
				contents,
			},
		});
	}

	async live() {
		return await this._api.users.live(this);
	}

}

@Serializable()
export class UserMiniProfile extends UserSearchProfile {

	@JsonProperty() country!: Country;

	@JsonProperty() date_joined!: string;

	@JsonProperty() description!: string;

	@JsonProperty() follow_status!: number;

	@JsonProperty() follower_count!: number;

	@JsonProperty() following_count!: number;

	@JsonProperty() gender!: number;

	@JsonProperty() is_staff!: boolean;

	@JsonProperty() top_impressions!: number[];

	constructor() {

		super();

	}
}

@Serializable()
export class User extends UserMiniProfile {

	@JsonProperty() email!: string;

	@JsonProperty() is_public_cast_storage!: boolean;

	@JsonProperty() is_public_like!: boolean;

	@JsonProperty() sns_type!: string;

	@JsonProperty() top_fans!: User[];

	@JsonProperty() is_exist!: boolean;

	@JsonProperty() is_dj!: boolean;

	@JsonProperty() regular_score!: number;

	@JsonProperty() is_fixedmng!: boolean;

	@JsonProperty() guest_status!: number;

	// deprecated
	@JsonProperty() fanboard_info!: FanboardInfo;

	constructor() {

		super();

	}
}

@Serializable()
export class LogonUser extends User {

	@JsonProperty() date_of_birth!: string;

	@JsonProperty() grants!: Grants;

	@JsonProperty() is_changed_username!: boolean;

	@JsonProperty() budget!: Budget;

	@JsonProperty() phone_number!: string;

	@JsonProperty() is_choice!: boolean;

	@JsonProperty() service_agreement!: ServiceAgreement;

	@JsonProperty() push_settings!: PushSettings;

	@JsonProperty() is_password_notice!: boolean;

	@JsonProperty() token!: string;

	@JsonProperty() refresh_token!: string;

	constructor() {

		super();

	}

}

@Serializable()
export class UserNameExist extends SpoonSession {

	@JsonProperty() is_exist!: boolean;

}
