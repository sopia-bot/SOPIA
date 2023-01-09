import { User } from "./user";

export interface SopiaApiClient {
	protocol: string;
	host: string;
	logonUser: User;

	ApiURL: string;

	req: (method: string, url: string, data?: any) => Promise<any>;
}