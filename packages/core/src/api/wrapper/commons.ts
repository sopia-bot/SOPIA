import { SpoonClient } from '../../spoon/';
import {
	HttpRequestWrapper,
	ApiGetProfileImgUrl,
	ApiGetCastImgUrl,
} from '../';

export class CommonApiWrapper {

	constructor(private _client: SpoonClient) {
	}

	get request() {
		return this._client.api.request;
	}

	async profileUrl(): HttpRequestWrapper<ApiGetProfileImgUrl.Request, ApiGetProfileImgUrl.Response> {
		return await this.request<ApiGetProfileImgUrl.Request, ApiGetProfileImgUrl.Response>(ApiGetProfileImgUrl);
	}

	async castUrl(): HttpRequestWrapper<ApiGetCastImgUrl.Request, ApiGetCastImgUrl.Response> {
		return await this.request<ApiGetCastImgUrl.Request, ApiGetCastImgUrl.Response>(ApiGetCastImgUrl);
	}

}
