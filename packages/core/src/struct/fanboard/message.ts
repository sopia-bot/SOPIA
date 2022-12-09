/*
 * message.ts
 * Created on Tue Apr 27 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { SpoonSession } from '../session';
import { User } from '../user/';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

@Serializable()
export class FanMessages extends SpoonSession {

	@JsonProperty() public author!: User;

	@JsonProperty() public contents!: string;

	@JsonProperty() public created!: string;

	@JsonProperty() public extra!: any; // unknown type

	@JsonProperty() public id!: number;

	@JsonProperty() public is_blind!: boolean;

	@JsonProperty() public message_count!: number;

	@JsonProperty() public path!: string;

	@JsonProperty() public referer!: string;

	@JsonProperty() public to_user!: any; // unknown type maybe User type

}
