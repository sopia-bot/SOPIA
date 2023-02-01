import { getFileSystem, pushLiveChunk } from "@sopia-bot/bridge";

const fs = getFileSystem();

export type TrackOption = {
	type: 'file';
	trackName: string;
	filePath: string;
	context?: OfflineAudioContext;
	buffer?: ArrayBuffer;
	audioBuffer?: AudioBufferSourceNode;
}

export class LiveContext extends Map<string, any> {
	private mainContext = new AudioContext();
	private destination = this.mainContext.createMediaStreamDestination();
	private recorder = new MediaRecorder(this.destination.stream, { mimeType: 'audio/webm;codecs=opus' });

	constructor() {
		super();
		this.recorder.addEventListener('dataavailable', async (evt: BlobEvent) => {
			const buffer = Buffer.from(await evt.data.arrayBuffer())
			await pushLiveChunk(buffer);
		});
	}

	start(timeslice = 5000) {
		this.recorder.start(timeslice);
		for ( const track of this.values() ) {
			if ( track.type ) {
				track.audioBuffer.start();
			}
		}
	}

	async addTrack(option: TrackOption): Promise<void> {
		const uid = crypto.randomUUID();
		if ( this.has(uid) ) return this.addTrack(option);
		await this.setTrack(uid, option);
		return;
	}

	async setTrack(id: string, option: TrackOption): Promise<LiveContext> {
		if ( option.type === 'file' ) {
			if ( option.filePath ) {
				option.buffer = (await fs.readFile(option.filePath) as Uint8Array).buffer;
				option.context = new OfflineAudioContext(2, option.buffer.byteLength, 48000);
				
				option.audioBuffer = this.mainContext.createBufferSource();
				option.audioBuffer.buffer = await option.context.decodeAudioData(option.buffer);
				option.audioBuffer.connect(this.destination);
			}
		}
		this.set(id, option);
		return this;
	}

}

const context = new LiveContext();

export function useLiveContext() {
	return context;
}