/*
 * request.ts
 * Created on Mon Apr 26 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { ApiResult, ApiResponse } from '.';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { SpoonClient } from '../../spoon/';
import { deserialize } from 'typescript-json-serializer';

export type HttpRequestWrapper<Req, Res> = Promise<HttpRequest<Req, Res>>;
export class HttpRequest<Request extends AxiosRequestConfig, Response extends any> {

	public url: string = '';
	public debug: boolean = false; // This is not use.
	public res!: ApiResult<Response>;

	constructor(private _client: SpoonClient, private _api: any, public options: Request) {
		if ( !this.options.headers ) {
			this.options.headers = {};
		}

		if ( typeof window === 'undefined' ) {
			this.headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36';
			this.headers['origin'] = 'https://www.spooncast.net';
			this.headers['referer'] = 'https://www.spooncast.net/';
		}
	}

	get method(): Method {
		return this.options.method as Method;
	}

	set method(val: Method) {
		this.options.method = val;
	}

	get params(): Record<string, string> {
		return this.options.params;
	}

	get headers(): Record<string, string> {
		return this.options.headers;
	}

	get data() {
		return this.options.data;
	}

	public async send(url: string = this.url): ApiResponse<Response> {
		this.options.url = url;
		this._client.hook.emit('http:request', this);

		try {
			const res = await axios(this.options);

			if ( res.data ) {
				if ( this.debug ) {
					console.error(this.options);
					console.error(res.data);
				}

				if ( this._api && Array.isArray(res.data.results) ) {
					res.data.results.forEach((result: any, idx: number) => {
						result['_client'] = this._client;
						res.data.results[idx] = deserialize<Response>(result, this._api.Response);
					});
				}

				this.res = res.data as ApiResult<Response>;
				this._client.hook.emit('http:response', this);
			}
		} catch(err) {
			if ( err.response ) {
				if ( this.debug ) {
					console.error(err.response);
				}
				this.res = err.response.data as ApiResult<any>;
			} else {
				throw err;
			}
		}

		return this.res;
	}

	public async next(): ApiResponse<Response> {
		return await this.send(this.res.next);
	}

	public async previous(): ApiResponse<Response> {
		return await this.send(this.res.previous);
	}

	static async Run<T extends any>(client: SpoonClient, options: AxiosRequestConfig): Promise<T> {
		const instance = new HttpRequest<any, any>(client, null, options);
		if ( options.url ) {
			instance.url = options.url;
		}
		return await instance.send() as T;
	}

}
