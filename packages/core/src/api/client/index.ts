/*
 * index.ts
 * Created on Fri Jun 25 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { Method, AxiosRequestConfig } from 'axios';

export interface RequestConfig extends AxiosRequestConfig {}

export interface ApiUrls {
	api: string;
	commonsApi: string;
	studioApi: string;
	cdn: string;
	socket: string;
	singApi: string;
	singSocket: string;
	stickerApiUrl: string;
	signatureStickerApiUrl: string;
	textDonationUrl: string;
	itemStoreApiUrl: string;
	billingApiUrl: string;
	auth?: string;
}

export interface ApiResult<T extends any> {
	detail: string;
	next: string;
	previous: string;
	results: T[];
	status_code: (string | number);
	data: T;
}

export type ApiResponse<T extends any> = Promise<ApiResult<T>>;

export * from './request';
export * from './client';
