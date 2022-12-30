import { SopiaApiClient } from "./client";

export class ContentApi {
	constructor(private api: SopiaApiClient) {}

	public getTerm() {
		return this.api.req('GET', '/contents/term/');
	}

	public getPrivacy() {
		return this.api.req('GET', '/contents/privacy/');
	}
}