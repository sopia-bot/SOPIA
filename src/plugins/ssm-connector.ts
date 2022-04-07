import {
	SpoonClient,
	EventEmitter,
	Live,
} from '@sopia-bot/core';
import axios from 'axios';
import * as uuid from 'uuid';
import logger from './logger';

const token = (t: string) => JSON.parse(
	Buffer.from(t.split('.')[1], 'base64')
		.toString('utf8'),
);

export class SSMConnector extends EventEmitter {

	public stream!: MediaStream;
	// origin 을 https://www.spooncast.net 으로 변경해야함
	// electron 에서 onBeforeSendHeaders 훅을 사용하여 해당 요청에 대해선 origin 을 변경하도록 적용
	private ws!: WebSocket;
	private pc!: RTCPeerConnection;
	private gfi = '';
	private msid = '';
	private tag = '';
	private keepAliveItv!: NodeJS.Timer;
	private live!: Live;
	private url = '';

	// message response 만 담아두는 상태관리 key 값은 type 이 된다.
	// tunnel 함수 등록으로 인해 원하는 key 가 세팅되면 (응답) 콜백을 실행한다.
	private tunnelQ = new Proxy({}, {
		set(target: any, p: string | symbol, value: any, receiver: any): boolean {
			if ( value.type === 'registration' ) {
				console.log('tunnel registration', p, value);
				target[p] = value;
			} else {
				console.log('other tunnel event', p, value, target[p]);
				if ( target[p] && target[p].callback ) {
					target[p].callback(value);
					delete target[p];
				}
			}
			return true;
		},
	});

	constructor(private sopia: SpoonClient) {
		super();
	}

	private get uuid(): string {
		return uuid.v4();
	}

	public Live(live: Live) {
		this.live = live;
		return this;
	}

	public Connect(): Promise<SSMConnector> {
		return new Promise(async (resolve) => {
			await this.create();
			this.ws = new WebSocket(this.url);
			this.ws.onmessage = (evt: MessageEvent) => {
				const receive = {
					...evt,
					data: JSON.parse(evt.data),
				};
				logger.success('SSM', '[CLI <- SRV]', evt.data);
				this.emit('message', receive);
				if ( receive.data.type ) {
					this.tunnelQ[receive.data.type] = receive.data;
				}
			};
			this.ws.onopen = async () => {
				console.log('socket open');
				this.emit('open');
				await this.RTCConnect.apply(this);
				resolve(this);
			};
		});
	}

	public send(data: any) {
		if ( typeof data === 'object' ) {
			data = JSON.stringify(data);
		}
		logger.info('SSM', '[CLI -> SRV]', data);
		this.ws.send(data);
	}

	public destroy() {
		this.ws.close();
		this.pc.close();
	}

	private async create() {
		const url = this.sopia.urls.singApi + '/v1/session/create';
		const { sub: tag } = token(this.sopia.logonUser.token);
		const { id: rtk } = token(this.live.room_token);
		this.tag = tag.toString();

		const data = {
			type: 'create',
			tag: this.tag,
			dup: 1,
			expd: 7200,
			kcnt: 10,
			rtk,
			pt: 'sndrecv',
			st: 'web/v1.55.0',
			iow: false,
			ua: this.sopia.userAgent,
			v: 'v0.5.1.24',
			tx: this.uuid,
		};

		const res = await axios({
			url,
			method: 'post',
			data,
		});
		this.url = this.sopia.urls.singSocket + '/ws/' + res.data.response;
	}

	private async RTCConnect() {
		await this.credential();
		await this.publishers();
		await this.sdpHandShake();
		await this.tunnel({
			from: this.tag,
			payload: JSON.stringify({
				cmd: 'add-listener',
				data: {
					userid: this.sopia.logonUser.id.toString(),
				},
			}),
			tx: this.uuid,
			type: 'msg',
		});
		this.keepAliveItv = setInterval(() => {
			this.send({
				tx: this.uuid,
				type: 'keep_alive',
			});
		}, 5000);
	}

	private tunnel<T>(req: { type: string, [k: string]: any }): Promise<T> {
		return new Promise((resolve) => {
			let type = req.type;
			if ( req.responseType ) {
				type = req.responseType;
				delete req.responseType;
			}
			this.tunnelQ[type] = {
				type: 'registration',
				callback: (arg: T) => {
					resolve(arg);
				},
			};
			this.send(req);
		});
	}

	private async credential() {
		const data = await this.tunnel<{ response: string, type: 'credential' }>({
			code: this.sopia.country,
			tx: this.uuid,
			type: 'credential',
		});
		this.pc = new RTCPeerConnection(({
			iceServers: [
				JSON.parse(data.response),
			],
		}));
		this.pc.ontrack = (evt) => {
			this.stream = evt.streams[0];
		};
		let candidateMutex = false;
		this.pc.onicecandidate = async (evt) => {
			if ( candidateMutex ) {
				return;
			}
			candidateMutex = true;
			if ( evt.candidate ) {
				await this.tunnel({
					candidate: evt.candidate.candidate,
					msid: this.msid,
					sdpMLineIndex: evt.candidate.sdpMLineIndex,
					sdpMid: evt.candidate.sdpMid,
					tx: this.uuid,
					type: 'candidate',
					responseType: 'candidate_response',
				});
				await this.pc.addIceCandidate(evt.candidate);
				await this.tunnel({
					completed: true,
					msid: this.msid,
					tx: this.uuid,
					type: 'candidate',
					responseType: 'candidate_response',
				});
				logger.success('SSM', 'candidate success');
			}
			candidateMutex = false;
		};  // onicecandidate
	}

	private async publishers() {
		const data = await this.tunnel<{result: [{ gfi: string }]}>({
			type: 'room',
			tx: this.uuid,
			payload: JSON.stringify({ detail: true }),
			cmd: 'publishers',
		});
		this.gfi = data.result[0].gfi;
	}

	private async sdpHandShake() {
		const offer = await this.tunnel<{sdp: string, type: 'offer', msid: string}>({
			gfi: this.gfi,
			person: 'participant',
			pt: 'sub',
			tx: this.uuid,
			type: 'enter',
			responseType: 'offer',
		});
		this.msid = offer.msid;
		await this.pc.setRemoteDescription(
			new RTCSessionDescription(offer),
		);
		const answer = await this.pc.createAnswer();
		await this.pc.setLocalDescription(answer);
		const data = await this.tunnel<any>({
			msid: this.msid,
			sdp: {
				type: answer.type,
				sdp: answer.sdp,
			},
			tx: this.uuid,
			type: 'sub',
		});
		if (
			data.type === 'sub' &&
			data.status === 200 &&
			data.msid.toString() === this.msid ) {
			return true;
		}
		throw Error(data);
	}

}
