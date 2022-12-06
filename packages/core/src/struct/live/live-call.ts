/*
 * live-call.ts
 * Created on Tue Apr 27 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { SpoonSession } from '../session';
import { User } from '../user/';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

@Serializable()
export class LiveCall extends SpoonSession {

	@JsonProperty() public guests!: User[];

	@JsonProperty() public version!: number;

}
