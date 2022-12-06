/*
 * login.ts
 * Created on Mon Apr 26 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { SnsType, Country } from '../../enum/';
import { LogonUser } from '../../struct/';
import { ApiResult, RequestConfig } from '../';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

export namespace ApiLogin {

	export const url = '/signin/';
	export const method = 'POST';

	export interface Request extends RequestConfig {

		'data': {

			'sns_type': SnsType;

			'sns_id': (number|string);

			'password': string;

			'country': Country;

		};

	}

	@Serializable()
	export class Response extends LogonUser {

		constructor() {

			super();

		}

	}

}
