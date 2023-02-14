import { StreamSettingEntity } from "@sopia-bot/bridge/dist/entities/setting";
import { ApiLivesCreate, Live, LiveSocket, SpoonClient as Client } from "@sopia-bot/core";
import { randomUUID } from "crypto";
import { ChildProcess, spawn } from "child_process";
import { serialize } from 'typescript-json-serializer';

export class SpoonWrapper extends Client {

	private currentLive!: Live;
	private sock!: LiveSocket;
	private url!: string;
	private ffmpeg!: ChildProcess;

	async createLive(prop: ApiLivesCreate.Request, streamSetting: StreamSettingEntity) {
		const req = await this.api.lives.create(prop);
		const [live] = req.res.results;
		this.currentLive = live;
		this.currentLive.initLiveEngine();
		this.url = await this.currentLive.liveEngine.publish();
		this.sock = await live.join(live.jwt);

		this.ffmpeg = spawn(
			streamSetting.command,
			[
				...streamSetting.args.split(/\s+/g),
				this.url
			],
		);

		console.log(`Running spawn [${streamSetting.command} ${streamSetting.args} ${this.url}]`);
    const returnData = serialize(live);
    delete returnData._client;
		return serialize(returnData);
	}

	push(chunk: Buffer) {
		this.ffmpeg.stdin?.write(chunk, (err) => {
			if ( err ) {
				console.error('write error', err);
			}
		});
	}

}
const client = new SpoonWrapper(randomUUID());
client.init();

export const getSpoonClient = () => client;

export const SpoonClient = {
	provide: 'SpoonClient',
	useFactory() {
		return client;
	},
}