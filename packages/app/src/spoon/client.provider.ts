import { StreamSettingEntity } from "@sopia-bot/bridge/dist/entities/setting";
import { ApiLivesCreate, Live, LiveEvent, LiveEventStruct, LiveSocket, SpoonClient as Client } from "@sopia-bot/core";
import { randomUUID } from "crypto";
import { ChildProcess, spawn } from "child_process";
import { serialize } from 'typescript-json-serializer';
import { useBrowserWindow } from "../utils/window.provider";

export class SpoonWrapper extends Client {

	private currentLive: Live|null = null;
	private sock!: LiveSocket;
	private url!: string;
	private ffmpeg: ChildProcess|null = null;

	async createLive(prop: ApiLivesCreate.Request, streamSetting: StreamSettingEntity) {
		const req = await this.api.lives.create(prop);
    console.log('prop', prop, 'req', req);
		const [live] = req.res.results;
		this.currentLive = live;
		this.currentLive.initLiveEngine();
		const url = await this.currentLive.liveEngine.publish();
		this.sock = await live.join(live.jwt);
    this.sock.on(LiveEvent.LIVE_EVENT_ALL, (data) => {
      console.log(`[${data.event}]`);
      this.spreadEvent(data);
    });

    this.settingLive(url, streamSetting);

    const returnData = serialize(live);
    delete returnData._client;
		return {
      ...serialize(returnData),
      publishUrl: url,
    };
	}

  spreadEvent(evt: LiveEventStruct) {
    const browser = useBrowserWindow();
    browser?.webContents.send(`live/sock/${evt.event}`, evt);
    browser?.webContents.send(`live/sock/${LiveEvent.LIVE_EVENT_ALL}`, evt);
  }

  settingLive(url: string, streamSetting: StreamSettingEntity) {
    this.url = url;
    const options = [
      ...streamSetting.args.split(/\s+/g),
      this.url
    ];

		this.ffmpeg = spawn(
			streamSetting.command,
			options,
		);

    this.ffmpeg.stderr?.on('data', (data: Buffer) => {
      //console.error('[FFMPEG] Error', data.toString('utf8'));
    })

		console.log(`Running spawn [${streamSetting.command} ${options.join(' ')}]`);
  }

  closeLive() {
    this.ffmpeg?.kill();
    this.ffmpeg = null;

    this.sock?.removeAllListeners(LiveEvent.LIVE_EVENT_ALL);
    
    if ( this.currentLive ) {
      this.api.lives.close(this.currentLive, {
        headers: {
          'x-live-authorization': this.currentLive.jwt,
        },
        data: {
          is_save: false,
        },
      });
    }

    this.url = '';
    this.currentLive = null;

  }

	push(chunk: Buffer) {
		this.ffmpeg?.stdin?.write(chunk, (err) => {
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