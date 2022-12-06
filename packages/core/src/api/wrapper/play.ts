/*
 * play.ts
 * Created on Wed Jun 30 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { SpoonClient } from '../../spoon/';
import {
	HttpRequestWrapper,
	ApiPlayMailboxCreate,
	ApiPlayGetMailbox,
	ApiPlayMailboxCurrent,
	ApiPlayMailboxClose,
	ApiPlayMailboxReportMessage,
	ApiPlayMailboxRemoveMessage,
	ApiPlayMailboxGetMessages,
	ApiPlayMailboxWriteMessage,
	ApiPlayGetPoll,
	ApiPlayPollCreate,
	ApiPlayPollClose,
	ApiPlayPollVote,
	ApiPlayStatus,
} from '../';

export class PlayMailboxApiWrapper {

	constructor(private _client: SpoonClient) {
	}

	get request() {
		return this._client.api.request;
	}

	async info(mailbox: number): HttpRequestWrapper<ApiPlayGetMailbox.Request, ApiPlayGetMailbox.Response> {
		return await this.request<ApiPlayGetMailbox.Request, ApiPlayGetMailbox.Response>(ApiPlayGetMailbox, mailbox);
	}

	async create(req: ApiPlayMailboxCreate.Request): HttpRequestWrapper<ApiPlayMailboxCreate.Request, ApiPlayMailboxCreate.Response> {
		return await this.request<ApiPlayMailboxCreate.Request, ApiPlayMailboxCreate.Response>(ApiPlayMailboxCreate, req);
	}

	async current(mailbox: number, req: ApiPlayMailboxCurrent.Request): HttpRequestWrapper<ApiPlayMailboxCurrent.Request, ApiPlayMailboxCurrent.Response> {
		return await this.request<ApiPlayMailboxCurrent.Request, ApiPlayMailboxCurrent.Response>(ApiPlayMailboxCurrent, mailbox, req);
	}

	async close(mailbox: number): HttpRequestWrapper<ApiPlayMailboxClose.Request, ApiPlayMailboxClose.Response> {
		return await this.request<ApiPlayMailboxClose.Request, ApiPlayMailboxClose.Response>(ApiPlayMailboxClose, mailbox);
	}

	async messageReport(message: number, req: ApiPlayMailboxReportMessage.Request): HttpRequestWrapper<ApiPlayMailboxReportMessage.Request, ApiPlayMailboxReportMessage.Response> {
		return await this.request<ApiPlayMailboxReportMessage.Request, ApiPlayMailboxReportMessage.Response>(ApiPlayMailboxReportMessage, message, req);
	}

	async messageRemove(message: number, req: ApiPlayMailboxRemoveMessage.Request): HttpRequestWrapper<ApiPlayMailboxRemoveMessage.Request, ApiPlayMailboxRemoveMessage.Response> {
		return await this.request<ApiPlayMailboxRemoveMessage.Request, ApiPlayMailboxRemoveMessage.Response>(ApiPlayMailboxRemoveMessage, message, req);
	}

	async messageInfo(message: number): HttpRequestWrapper<ApiPlayMailboxGetMessages.Request, ApiPlayMailboxGetMessages.Response> {
		return await this.request<ApiPlayMailboxGetMessages.Request, ApiPlayMailboxGetMessages.Response>(ApiPlayMailboxGetMessages, message);
	}

	async messageWrite(message: number, req: ApiPlayMailboxWriteMessage.Request): HttpRequestWrapper<ApiPlayMailboxWriteMessage.Request, ApiPlayMailboxWriteMessage.Response> {
		return await this.request<ApiPlayMailboxWriteMessage.Request, ApiPlayMailboxWriteMessage.Response>(ApiPlayMailboxWriteMessage, message, req);
	}

}

export class PlayPollApiWrapper {

	constructor(private _client: SpoonClient) {
	}

	get request() {
		return this._client.api.request;
	}

	async info(poll: number): HttpRequestWrapper<ApiPlayGetPoll.Request, ApiPlayGetPoll.Response> {
		return await this.request<ApiPlayGetPoll.Request, ApiPlayGetPoll.Response>(ApiPlayGetPoll, poll);
	}

	async create(req: ApiPlayPollCreate.Request): HttpRequestWrapper<ApiPlayPollCreate.Request, ApiPlayPollCreate.Response> {
		return await this.request<ApiPlayPollCreate.Request, ApiPlayPollCreate.Response>(ApiPlayPollCreate, req);
	}

	async close(poll: number): HttpRequestWrapper<ApiPlayPollClose.Request, ApiPlayPollClose.Response> {
		return await this.request<ApiPlayPollClose.Request, ApiPlayPollClose.Response>(ApiPlayPollClose, poll);
	}

	async vote(poll: number, req: ApiPlayPollVote.Request): HttpRequestWrapper<ApiPlayPollVote.Request, ApiPlayPollVote.Response> {
		return await this.request<ApiPlayPollVote.Request, ApiPlayPollVote.Response>(ApiPlayPollVote, poll, req);
	}

}

export class PlayApiWrapper {

	public mailbox: PlayMailboxApiWrapper;
	public poll: PlayPollApiWrapper;

	constructor(private _client: SpoonClient) {
		this.mailbox = new PlayMailboxApiWrapper(this._client);
		this.poll = new PlayPollApiWrapper(this._client);
	}

	get request() {
		return this._client.api.request;
	}

	async status(req: ApiPlayStatus.Request): HttpRequestWrapper<ApiPlayStatus.Request, ApiPlayStatus.Response> {
		return await this.request<ApiPlayStatus.Request, ApiPlayStatus.Response>(ApiPlayStatus, req);
	}

}
