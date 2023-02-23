import { SpoonClient } from "../../spoon";
import { Live } from "./live";
import { HttpRequest } from "../../api";

type PublishType = {
	publish: {
		name: string;
		control: string;
		transports: [
      {
        type: string;
        address: string;
        port: number;
      }
    ];
		media: {
			type: string;
			protocol: 'rtmp'|'srt';
			format: string;
		};
		rtmp: {
			url: string;
			name: string;
		};
	};
};

export class LiveEngine {
	constructor(private client: SpoonClient, private live: Live, private port = 5021) {}

	get baseURL() {
		return `http://${this.live.host_address}:${this.port}/sori/4`;
	}

	public async publish(protocol: 'rtmp'|'srt' = 'rtmp') {
		const res = await HttpRequest.Run<PublishType>(this.client, {
			url: `${this.baseURL}/publish/${this.live.stream_name}`,
			method: 'post',
			headers: {
				authorization: `Bearer ${this.client.logonUser.token}`,
				'x-live-authorization': this.live.jwt,
			},
			data: {
				media: {
					type: 'audio',
					protocol,
					format: 'aac',
				},
				reason: {
					code: 50000,
					message: 'unknown',
				},
				props: {
					country: this.client.country,
					stage: 'prod',
					live_id: this.live.id.toString(),
					user_id: this.client.logonUser.id.toString(),
					user_tag: this.client.logonUser.tag,
					platform: 'sopia',
					os: 'Linux',
				},
			},
		});

    if ( protocol === 'srt' ) {
      return `srt://${res.publish.transports[0].address}:${res.publish.transports[0].port}`
    }
		return `${res.publish.rtmp.url}/${res.publish.rtmp.name}`;
	}
}