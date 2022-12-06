/*
 * live-category.ts
 * Created on Wed Apr 28 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { ApiResult, RequestConfig } from '../';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

export namespace ApiTastesLiveCategory {

	export const url = '/tastes/live-category/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

		'params': {
			'lang': string;
		};

	}

	// TODO: Unknown response data type
	@Serializable()
	export class Response {

	}

}

export namespace ApiTastesLiveCategoryChoice {

	export const url = '/tastes/live-category/choice/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

		'params': {
			'lang': string;
		};

	}

	// TODO: Unknown response data type
	@Serializable()
	export class Response {

	}

}

export namespace ApiTastesSetLiveCategoryChoice {

	export const url = '/tastes/live-category/choice/';
	export const method = 'POST';

	export interface Request extends RequestConfig {

		'data': {
			'taste_data_ids': number[];
		};

	}

	// TODO: Unknown response data type
	@Serializable()
	export class Response {

	}

}
