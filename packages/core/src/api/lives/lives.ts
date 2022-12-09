/*
 * lives.ts
 * Created on Tue Apr 27 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { RequestConfig } from '../';
import { Live, ContentsInfo } from '../../struct/';
import { Category } from '../../enum/';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

export namespace ApiLivesBanner {

	export const url = '/lives/banner/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

	}

	@Serializable()
	export class Response extends ContentsInfo {

		constructor() {

			super();

		}

	}

}

export namespace ApiLivesPopular {

	export const url = '/lives/popular/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

		'params': {

			'page_size': number;

			'is_adult': boolean;

			'category': Category;

		};

	}

	@Serializable()
	export class Response extends Live {

	}

}

export namespace ApiLivesSubscribed {

	export const url = '/lives/subscribed/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

		'params': {

			'page_size': number;

			'is_adult': boolean;

		};

	}

	@Serializable()
	export class Response extends Live {

		constructor() {

			super();

		}

	}

}
