/*
 * tastes.ts
 * Created on Wed Jun 30 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { SpoonClient } from '../../spoon/';
import {
	HttpRequestWrapper,
	ApiTastesAgeGroup,
	ApiTastesAgeGroupChoice,
	ApiTastesSetAgeGroupChoice,
	ApiTastesGender,
	ApiTastesGenderChoice,
	ApiTastesSetGenderChoice,
	ApiTastesLiveCategory,
	ApiTastesLiveCategoryChoice,
	ApiTastesSetLiveCategoryChoice,
} from '../';

export class TastesAgeGroupApiWrapper {

	constructor(private _client: SpoonClient) {
	}

	get request() {
		return this._client.api.request;
	}

	async info(req: ApiTastesAgeGroup.Request): HttpRequestWrapper<ApiTastesAgeGroup.Request, ApiTastesAgeGroup.Response> {
		return await this.request<ApiTastesAgeGroup.Request, ApiTastesAgeGroup.Response>(ApiTastesAgeGroup, req);
	}

	async choice(req: ApiTastesAgeGroupChoice.Request): HttpRequestWrapper<ApiTastesAgeGroupChoice.Request, ApiTastesAgeGroupChoice.Response> {
		return await this.request<ApiTastesAgeGroupChoice.Request, ApiTastesAgeGroupChoice.Response>(ApiTastesAgeGroupChoice, req);
	}

	async choiceUpdate(req: ApiTastesSetAgeGroupChoice.Request): HttpRequestWrapper<ApiTastesSetAgeGroupChoice.Request, ApiTastesSetAgeGroupChoice.Response> {
		return await this.request<ApiTastesSetAgeGroupChoice.Request, ApiTastesSetAgeGroupChoice.Response>(ApiTastesSetAgeGroupChoice, req);
	}

}

export class TastesGenerApiWrapper {

	constructor(private _client: SpoonClient) {
	}

	get request() {
		return this._client.api.request;
	}

	async info(req: ApiTastesGender.Request): HttpRequestWrapper<ApiTastesGender.Request, ApiTastesGender.Response> {
		return await this.request<ApiTastesGender.Request, ApiTastesGender.Response>(ApiTastesGender, req);
	}

	async choice(req: ApiTastesGenderChoice.Request): HttpRequestWrapper<ApiTastesGenderChoice.Request, ApiTastesGenderChoice.Response> {
		return await this.request<ApiTastesGenderChoice.Request, ApiTastesGenderChoice.Response>(ApiTastesGenderChoice, req);
	}

	async choiceUpdate(req: ApiTastesSetGenderChoice.Request): HttpRequestWrapper<ApiTastesSetGenderChoice.Request, ApiTastesSetGenderChoice.Response> {
		return await this.request<ApiTastesSetGenderChoice.Request, ApiTastesSetGenderChoice.Response>(ApiTastesSetGenderChoice, req);
	}

}

export class TastesLiveCategoryApiWrapper {

	constructor(private _client: SpoonClient) {
	}

	get request() {
		return this._client.api.request;
	}

	async info(req: ApiTastesLiveCategory.Request): HttpRequestWrapper<ApiTastesLiveCategory.Request, ApiTastesLiveCategory.Response> {
		return await this.request<ApiTastesLiveCategory.Request, ApiTastesLiveCategory.Response>(ApiTastesLiveCategory, req);
	}

	async choice(req: ApiTastesLiveCategoryChoice.Request): HttpRequestWrapper<ApiTastesLiveCategoryChoice.Request, ApiTastesLiveCategoryChoice.Response> {
		return await this.request<ApiTastesLiveCategoryChoice.Request, ApiTastesLiveCategoryChoice.Response>(ApiTastesLiveCategoryChoice, req);
	}

	async choiceUpdate(req: ApiTastesSetLiveCategoryChoice.Request): HttpRequestWrapper<ApiTastesSetLiveCategoryChoice.Request, ApiTastesSetLiveCategoryChoice.Response> {
		return await this.request<ApiTastesSetLiveCategoryChoice.Request, ApiTastesSetLiveCategoryChoice.Response>(ApiTastesSetLiveCategoryChoice, req);
	}

}

export class TastesApiWrapper {

	public ageGroup: TastesAgeGroupApiWrapper;
	public gender: TastesGenerApiWrapper;
	public liveCategory: TastesLiveCategoryApiWrapper;

	constructor(private _client: SpoonClient) {
		this.ageGroup = new TastesAgeGroupApiWrapper(this._client);
		this.gender = new TastesGenerApiWrapper(this._client);
		this.liveCategory = new TastesLiveCategoryApiWrapper(this._client);
	}

	get request() {
		return this._client.api.request;
	}

}
