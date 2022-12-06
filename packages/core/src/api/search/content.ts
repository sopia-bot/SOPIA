/*
 * content.ts
 * Created on Mon May 03 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { ApiResult, RequestConfig } from '../';
import { Live, Cast } from '../../struct/';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

export namespace ApiSearchContent {

	export const url = '/search/content/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

		'params': {

			'keyword': string;

			'content_type': 'live'|'cast'|'talk';

		};

	}

	@Serializable()
	export class LiveResponse extends Live {

		constructor() {

			super();

		}

	}

	@Serializable()
	export class CastResponse extends Cast {

		constructor() {

			super();

		}

	}

	export const key = 'params.content_type';
	export function R(type: 'live'|'cast'|'talk') {
		switch( type ) {
			case 'live': return LiveResponse;
			case 'cast': return CastResponse;
		}
	}

}
