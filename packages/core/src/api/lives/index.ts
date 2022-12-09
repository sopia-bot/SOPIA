/*
 * index.ts
 * Created on Tue Apr 27 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { RequestConfig } from '../';

export interface ApiLivesRequestConfig extends RequestConfig {

	'headers': {

		'x-live-authorization': string;

	};

}

export * from './lives';
export * from './info';
export * from './update';
