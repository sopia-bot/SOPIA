/*
 * info.ts
 * Created on Thu Apr 29 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { RequestConfig, ApiLivesRequestConfig } from '../';
import { SpoonClient } from '../../spoon/';
import { Live, User, UserSearchProfile } from '../../struct/';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

export namespace ApiLivesInfo {

	export const url = '/lives/0000/';
	export const method = 'GET';

	export interface Request extends ApiLivesRequestConfig {

	}

	@Serializable()
	export class Response extends Live {

	}

}

export namespace ApiLivesCreate {

	export const url = '/lives/';
	export const method = 'POST';

	export interface Request extends RequestConfig {

        'data': {

            'is_adult': boolean;

            'is_save': boolean;

            'donation': number;

            'title': string;

            'type': number;

            'welcome_message': string;

            'invite_member_ids': number[];

            'tags': string[],

            'categories': string[],

            'engine': {

                'name': "sing"|"sori";

                'host': string;

            };

            'is_live_call': boolean;

            'device_unique_id': string,

            'spoon_aim': { title: string, count: number }[];

        };

	}

	@Serializable()
	export class Response extends Live {

	}

}

export namespace ApiLivesListeners {

	export const url = '/lives/0000/listeners/';
	export const method = 'GET';

	export interface Request extends ApiLivesRequestConfig {

	}

	@Serializable()
	export class Response extends User {

	}

}

export namespace ApiLivesListenersFans {

	export const url = '/lives/0000/listeners/fans';
	export const method = 'GET';

	export interface Request extends ApiLivesRequestConfig {

	}

	@Serializable()
	export class Response extends User {

	}

}

export namespace ApiLivesSponsor {

	export const url = '/lives/0000/sponsor/';
	export const method = 'GET';

	export interface Request extends ApiLivesRequestConfig {

	}

	@Serializable()
	export class Response {

		@JsonProperty() private _client!: SpoonClient;

		@JsonProperty() public amount!: number;

		@JsonProperty() public to_user!: UserSearchProfile;

	}

}

export namespace ApiLivesLike {

	export const url = '/lives/0000/like/';
	export const method = 'GET';

	export interface Request extends ApiLivesRequestConfig {

	}

	@Serializable()
	export class Response extends UserSearchProfile {

	}

}

export namespace ApiLivesSetLike {

	export const url = '/lives/0000/like/';
	export const method = 'POST';

	export interface Request extends ApiLivesRequestConfig {

	}

	@Serializable()
	export class Response extends Live {

	}

}

export namespace ApiLivesToken {

	export const url = '/lives/0000/token/';
	export const method = 'POST';

	export interface Request extends RequestConfig {

		'data': {

			'device_unique_id': string;

		};

	}

	@Serializable()
	export class Response {

		@JsonProperty() public jwt!: string;

		@JsonProperty() public items!: any[]; // unknown type

	}

}

export namespace ApiLivesAccess {

	export const url = '/lives/0000/access/';
	export const method = 'GET';

	export interface Request extends ApiLivesRequestConfig {

	}

	@Serializable()
	export class Response extends Live {

	}

}
