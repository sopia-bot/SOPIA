import { ApiLivesCreate, Live, LiveSocket, SpoonClient as Client } from "@sopia-bot/core";
import { randomUUID } from "crypto";
import { LiveTrackInfo } from '@sopia-bot/bridge';


export class SpoonWrapper extends Client {

	private currentLive!: Live;
	private sock!: LiveSocket;
	private url!: string;
	private trackList: LiveTrackInfo[] = [];

	async createLive(prop: ApiLivesCreate.Request) {
		const req = await this.api.lives.create(prop);
		const [live] = req.res.results;
		this.sock = await live.join(live.jwt);
		this.currentLive = live;
		this.currentLive.initLiveEngine();
		this.url = await this.currentLive.liveEngine.publish();
		return live;
	}

	track(trackList: LiveTrackInfo[]) {
		this.trackList = trackList;
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