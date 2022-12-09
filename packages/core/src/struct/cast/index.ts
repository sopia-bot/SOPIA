/*
 * index.ts
 * Created on Mon May 03 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { ContentsInfo } from '../';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

@Serializable()
export class Cast extends ContentsInfo {

	@JsonProperty() public category!: string;

	@JsonProperty() public voice_url!: string;

	@JsonProperty() public play_count!: number;

	@JsonProperty() public spoon_count!: number;

	@JsonProperty() public reporters!: any[]; // unknown type

	@JsonProperty() public duration!: number;

	@JsonProperty() public text_comment_count!: number;

	@JsonProperty() public is_like!: boolean;

	constructor() {

		super();

	}
}

@Serializable()
export class CastInfo {

	@JsonProperty() public state_date!: string;

	@JsonProperty() public cast!: Cast;

	@JsonProperty() public score!: number;

	@JsonProperty() public updown!: string;

	@JsonProperty() public cast_count!: number;

	@JsonProperty() public start_date!: number;

	@JsonProperty() public end_date!: number;

}
