/*
 * index.ts
 * Created on Thu Apr 29 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { RequestConfig } from '../';
import { FanMessages } from '../../struct/';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

export namespace ApiModifyFancomments {

	export const url = '/fancomments/0000/messages/';
	export const method = 'PUT';

	export interface Request extends RequestConfig {

		'data': {

			'contents': string;

			'is_parent': boolean;

		};

	}

	// none response
	@Serializable()
	export class Response {

	}

}

export namespace ApiRemoveFancomments {

	export const url = '/fancomments/0000/';
	export const method = 'DELETE';

	export interface Request extends RequestConfig {

	}

	// none response
	@Serializable()
	export class Response {

	}

}

export namespace ApiBlindFancomments {

	export const url = '/fancomments/0000/blind/';
	export const method = 'POST';

	export interface Request extends RequestConfig {

	}

	// TODO: Unknown response data type
	@Serializable()
	export class Response {

	}

}

export namespace ApiGetFancommentsMessages {

	export const url = '/fancomments/0000/messages/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

	}

	@Serializable()
	export class Response extends FanMessages {

		constructor() {

			super();

		}

	}

}

export namespace ApiFancommentsWriteMessages {

	export const url = '/fancomments/0000/messages/';
	export const method = 'POST';

	export interface Request extends RequestConfig {

		'data': {

			'contents': string;

		};

	}

	@Serializable()
	export class Response extends FanMessages {

		constructor() {

			super();

		}

	}

}

export namespace ApiFancommentsModifyMessages {

	export const url = '/fancomments/0000/messages/';
	export const method = 'PUT';

	export interface Request extends RequestConfig {

		'data': {

			'contents': string;

			'fanmsg_id': number;

			'is_parent': boolean;

		};

	}

	// none response
	@Serializable()
	export class Response {

	}

}

export namespace ApiFancommentsRemoveMessages {

	export const url = '/fancomments/0000/messages/';
	export const method = 'DELETE';

	export interface Request extends RequestConfig {

		'params': {

			'fanmsg_id': number;

			'is_parent': boolean;

		};

	}

	// none response
	@Serializable()
	export class Response {

	}

}
