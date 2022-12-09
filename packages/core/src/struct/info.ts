/*
 * info.ts
 * Created on Thu Jun 24 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { SpoonSession } from './session';
import { UserMiniProfile } from './user/profile';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

@Serializable()
export class ContentsInfo extends SpoonSession {

	@JsonProperty() public id!: number;

	@JsonProperty() public title!: string;

	@JsonProperty() public author!: UserMiniProfile;

	@JsonProperty() public img_url!: string;

	@JsonProperty() public tags!: string[];

	@JsonProperty() public like_count!: number;

	@JsonProperty() public created!: string;

	@JsonProperty() public type!: number; //unknown value

}

@Serializable()
export class UrlInfo extends SpoonSession {

	@JsonProperty() public url!: string;

	@JsonProperty() public key!: string;

	@JsonProperty() public content_type!: string;

}

@Serializable()
export class ProfileUrlInfo extends SpoonSession {

	@JsonProperty() public voice!: UrlInfo;

	@JsonProperty() public image!: UrlInfo;

}
