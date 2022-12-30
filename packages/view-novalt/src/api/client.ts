
export interface SopiaApiClient {
	protocol: string;
	host: string;
	user: any;

	ApiURL: string;

	req: (method: string, url: string, data?: any) => Promise<any>;
}