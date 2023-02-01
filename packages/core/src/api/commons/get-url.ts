/*
 * get-url.ts
 * Created on Mon May 03 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { RequestConfig } from '../';
import { ProfileUrlInfo } from '../../struct/';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

export namespace ApiGetProfileImgUrl {

	export const url = '/commons/profile/url/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

	}

	@Serializable()
	export class Response extends ProfileUrlInfo {

	}

}

export namespace ApiGetCastImgUrl {

	export const url = '/commons/cast/url/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

	}

	@Serializable()
	export class Response extends ProfileUrlInfo {

	}

}