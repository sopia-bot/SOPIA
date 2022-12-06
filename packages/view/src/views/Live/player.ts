import { SSMConnector } from '@/plugins/ssm-connector';
import Hls from 'hls.js';
import { Live } from '@sopia-bot/core';
import logger from '@/plugins/logger';

export class Player {
	private player!: Hls | SSMConnector;
	private audio = new Audio();
	private live!: Live;

	get engine() {
		return this.live.engine_name;
	}

	get volume() {
		return this.audio.volume;
	}

	set volume(val) {
		this.audio.volume = val;
	}

	public play() {
		this.audio.play();
	}

	public pause() {
		this.audio.pause();
	}

	public destroy() {
		this.audio.pause();
		this.audio = new Audio();
		if ( this.player ) {
			this.player.destroy();
		}
	}

	public connect(live: Live) {
		this.live = live;

		console.log('player', live);

		if ( this.engine === 'sing' ) {
			// WEB
			(async () => {
				this.player = await new SSMConnector(window.$sopia)
					.Live(live)
					.Connect();
				this.audio.srcObject = this.player.stream;
			})();
		} else if ( this.engine === 'sori' ) {
			// Mobile
			this.player = new Hls();
			this.player.loadSource(live.url_hls);
			this.player.attachMedia(this.audio);
		} else {
			logger.err('live', 'Unknown live engine name', this.live);
			throw Error('Unknown live engine name');
		}
		this.audio.play();

	}

}
