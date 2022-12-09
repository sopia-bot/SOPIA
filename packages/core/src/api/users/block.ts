/*
 * block.ts
 * Created on Tue Apr 27 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { ApiResult, RequestConfig } from '../';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

export namespace ApiUsersBlock {

	export const url = '/users/0000/block/';
	export const method = 'POST';

	export interface Request extends RequestConfig {

	}

	// none response
	@Serializable()
	export class Response {

	}

}

export namespace ApiUsersUnBlock {

	export const url = '/users/0000/unblock/';
	export const method = 'POST';

	export interface Request extends RequestConfig {

	}

	// none response
	@Serializable()
	export class Response {

	}

}
