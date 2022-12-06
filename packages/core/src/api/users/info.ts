/*
 * info.ts
 * Created on Tue Apr 27 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { ApiResult, RequestConfig } from '../';
import {
	User,
	UserMiniProfile,
	UserNameExist,
	FanMessages
} from '../../struct/';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

export namespace ApiUsersInfo {

	export const url = '/users/0000/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

	}

	@Serializable()
	export class Response extends User {

		constructor() {

			super();

		}

	}

}

export namespace ApiSetUsersInfo {

	export const url = '/users/0000/';
	export const method = 'PUT';

	export interface Request extends RequestConfig {

		'data': {

			'date_of_birth'?: string;

			'gender'?: number;

			'profile_key'?: string;

		};

	}

	@Serializable()
	export class Response extends User {

		constructor() {

			super();

		}

	}

}

export namespace ApiUsersMiniProfile {

	export const url = '/users/0000/mini_profile';
	export const method = 'GET';

	export interface Request extends RequestConfig {

	}

	@Serializable()
	export class Response extends UserMiniProfile {

		constructor() {

			super();

		}

	}

}

export namespace ApiUsersUsername {

	export const url = '/users/username/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

		'params': {

			'username': string;

		};

	}

	@Serializable()
	export class Response extends UserNameExist {

	}

}

export namespace ApiUsersSetUsername {

	export const url = '/users/username/';
	export const method = 'POST';

	export interface Request extends RequestConfig {

		'data': {

			'username': string;

		};

	}

	@Serializable()
	export class Response extends UserNameExist {

	}

}

export namespace ApiUsersVoice {

	export const url = '/users/0000/voice/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

	}

	// TODO: Unknown response data type
	@Serializable()
	export class Response {

	}

}

export namespace ApiUsersCasts {

	export const url = '/users/0000/casts/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

		'params'?: {

			'type': number;

		};

	}

	// TODO: Unknown response data type
	@Serializable()
	export class Response {

	}

}

export namespace ApiUsersFanmessages {

	export const url = '/users/0000/fanmessages/';
	export const method = 'GET';

	export interface Request extends RequestConfig {

	}

	@Serializable()
	export class Response extends FanMessages {

	}

}

export namespace ApiUsersWriteFanmessages {

	export const url = '/users/0000/fanmessages/';
	export const method = 'POST';

	export interface Request extends RequestConfig {

		'data': {

			'contents': string;

		};

	}

	@Serializable()
	export class Response extends FanMessages {

	}

}
