import { SopiaApiClient } from "./client";

export class UtilApi {
	constructor(private api: SopiaApiClient) {

	}

	public async activityLog(tag: string, data: string = '') {
		return await this.api.req('PUT', '/contents/activity/', { tag, data });
	}
}