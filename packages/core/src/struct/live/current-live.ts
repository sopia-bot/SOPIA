/*
 * current-live.ts
 * Created on Tue Apr 27 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 *
 * This file is absolutely necessary because it contains objects required by the circular dependency between ContentsInfo -> UserMiniprofile.
 * Current Live Class gets a property of Live Class, not all of them need to be the same.
 */
import { SpoonSession } from '../session';
import { Serializable, JsonProperty } from 'typescript-json-serializer';
import { LiveSocket } from '../../socket/';
import { ApiLivesRequestConfig } from '../../api/';

@Serializable()
export class CurrentLive extends SpoonSession {

	@JsonProperty() public id!: number;

	async info() {
		return await this._api.lives.info(this.id);
	}

	async access() {
		return await this._api.lives.access(this.id);
	}

	async join(): Promise<LiveSocket> {
		const req = await this.info();
		return await req.res.results[0].join();
	}

}
