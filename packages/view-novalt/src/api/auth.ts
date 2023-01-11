import { SopiaApiClient } from "./client";

export class AuthApi {
	constructor(private api: SopiaApiClient) {

	}

	public async login(id: string, pw: string) {
		const res = await this.api.req('POST', '/auth/login/', {
			id,
			pw,
		});

		const user = res.data[0];
		this.api.logonUser = user;

		return user;
	}

	public async signin(id: string, pw: string) {
		return await this.api.req('PUT', '/auth/sign/', {
			id,
			pw,
			name: id,
			gender: -1,
		});
	}
}