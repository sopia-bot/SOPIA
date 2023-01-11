/*
 * live.ts
 * Created on Thu Apr 29 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { ContentsInfo } from '../info';
import { User } from '../user/profile';
import { LiveCall } from './live-call';
import { Tier } from '../../enum/';
import { Serializable, JsonProperty } from 'typescript-json-serializer';
import { LiveSocket } from '../../socket/';
import { ApiLivesRequestConfig } from '../../api/';

@Serializable()
export class LiveInfo extends ContentsInfo {

	public socket!: LiveSocket;

	@JsonProperty() public access_key!: string;

	@JsonProperty() public categories!: string[];

	@JsonProperty() public engine_name!: string;

	@JsonProperty() public is_adult!: boolean;

	@JsonProperty() public is_editors!: boolean;

	@JsonProperty() public is_live_call!: boolean;

	@JsonProperty() public is_verified!: boolean;

	@JsonProperty() public is_vip!: boolean;

	@JsonProperty() public live_call!: LiveCall;

	@JsonProperty() public member_count!: number;

	@JsonProperty() public os_type!: any; //unknown type

	@JsonProperty() public room_token!: string;

	@JsonProperty() public jwt!: string;

	@JsonProperty() public tier!: Tier;

	@JsonProperty() public total_member_count!: number;

	@JsonProperty() public url_hls!: string;

	@JsonProperty() public host_address!: string;

	private _req(obj: any = {}): ApiLivesRequestConfig {
		if ( !obj.headers ) {
			obj.headers = {};
		}

		if ( !obj.headers['x-live-authorization'] ){
			obj.headers['x-live-authorization'] = this.socket?.RoomToken || '';
		}
		return obj as ApiLivesRequestConfig;
	}

	async info() {
		return await this._api.lives.info(this, this._req());
	}

	async listeners() {
		return await this._api.lives.listeners(this, this._req());
	}

	async listenersFans() {
		return await this._api.lives.listenersFans(this, this._req());
	}

	async sponsor() {
		return await this._api.lives.sponsor(this, this._req());
	}

	async like() {
		return await this._api.lives.like(this, this._req());
	}

	async access() {
		return await this._api.lives.access(this, this._req());
	}

	/*
	async setManager(manager_ids: number[]) {
		return await this._api.lives.setManager(this, {
			'data': {
				manager_ids,
			},
		});
	}

	async block(block_user_id: number) {
		return await this._api.lives.block(this, {
			'data': {
				block_user_id,
			},
		});
	}

	async close(is_save: boolean) {
		return await this._api.lives.close(this, {
			'data': {
				is_save,
			},
		});
	}
	*/

	async join(liveToken: string = ''): Promise<LiveSocket> {
		this.socket = new LiveSocket(this, this._client);
		if ( !liveToken ) {
			const req = await this._api.lives.token(this, {
				'data': {
					'device_unique_id': this._client.deviceUUID,
				},
			});
			if ( req.res.status_code !== 200 ) {
				throw req;
			}
			liveToken = req.res.results[0]?.jwt;
		}
		await this._api.lives.info(this, {
			'headers': {
				'x-live-authorization': liveToken,
			}
		});
		if ( ! await this.socket.join(liveToken) ) {
			throw Error('Can not join live to ' + this.id);
		}
		return this.socket;
	}

}

@Serializable()
export class Live extends LiveInfo {

	@JsonProperty() public welcome_message!: string;

	@JsonProperty() public top_fans!: { user: User }[];

	@JsonProperty() public url!: string;

	@JsonProperty() public stream_name!: string;

	@JsonProperty() public manager_ids!: number[];

	@JsonProperty() public is_like!: boolean;

	@JsonProperty() public is_freeze!: boolean;

	@JsonProperty() public is_mute!: boolean;

	@JsonProperty() public is_beginner!: boolean;

	@JsonProperty() public is_call!: boolean;

	@JsonProperty() public closed!: string;

	@JsonProperty() public close_status!: number;

	@JsonProperty() public is_save!: boolean;

	@JsonProperty() public is_join_now!: boolean;

	@JsonProperty() public protocol!: string;

	@JsonProperty() public msg_interval!: number;

	@JsonProperty() public donation!: number;

	@JsonProperty() public close_air_time!: string;

	constructor() {

		super();

	}
}
