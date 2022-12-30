import { SopiaApiClient } from "./client";

export interface UserDto {
	user_id: number;
	name?: string;
	gender?: -1|0|1;
	spoon_id?: string;
}

export interface User {
  user_id: number;
  name: string;
  gender: -1|0|1;
  id: string;
  password: string;
  spoon_id: string;
  saved_time: string;
	token: string;
	refresh_token: string;
}

export class UserApi {

	constructor(private api: SopiaApiClient) {

	}


	public async setInfo(data: UserDto): Promise<User> {
		return await this.api.req('PATCH', '/user/info', data);
	}

}