import { getFileSystem, pushLiveChunk } from "@sopia-bot/bridge";

const fs = getFileSystem();

export type TrackFileOption = {
	type: 'file';
	trackName: string;
  mute: boolean;
	filePath: string;
};
export type TrackInputOption = {
  type: 'input';
  trackName: string;
  mute: boolean;
  deviceId: string;
};
export type TrackOutputOption = {
  type: 'output';
  trackName: string;
};

export type TrackOption = TrackFileOption|TrackInputOption;
export type TrackItem = {
  uid: string;
  option: TrackOption;
	context?: OfflineAudioContext|AudioContext;
	buffer?: ArrayBuffer;
	audioBuffer?: AudioBufferSourceNode;
  stream?: MediaStream;
  source?: MediaStreamAudioSourceNode;
}

export class LiveContext extends Map<string, TrackItem> {
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
			if ( track.option.type === 'file' ) {
				track.audioBuffer?.start();
			}
		}
	}

	async addTrack(option: TrackOption): Promise<TrackItem> {
		const uid = crypto.randomUUID();
		if ( this.has(uid) ) return this.addTrack(option);
		return await this.setTrack(uid, option);
	}

	async setTrack(id: string, option: TrackOption): Promise<TrackItem> {
    const item: TrackItem = {
      uid: id,
      option,
    };
		if ( option.type === 'file' ) {
			if ( option.filePath ) {
				item.buffer = (await fs.readFile(option.filePath) as Uint8Array).buffer;
				item.context = new OfflineAudioContext(2, item.buffer.byteLength, 48000);
				
				item.audioBuffer = this.mainContext.createBufferSource();
				item.audioBuffer.buffer = await item.context.decodeAudioData(item.buffer);
				item.audioBuffer.connect(this.destination);
			}
		} else if ( option.type === 'input' ) {
      item.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: option.deviceId,
        },
      });
      //item.context = new AudioContext();
      //item.context.createMediaStreamSource(item.stream).connect(this.destination);
      item.source = this.mainContext.createMediaStreamSource(item.stream);
      item.source.connect(this.destination);
    }
		this.set(id, item);
		return item;
	}

  async deleteTrack(id: string): Promise<void> {
    const track = this.get(id);
    if ( !track ) return;
    
    console.log('11111', id)
    if ( track.option.type === 'file' ) {
      track.audioBuffer?.stop();
      track.audioBuffer?.disconnect(this.destination);
      delete track.audioBuffer;
      delete track.context;
      delete track.buffer;
    } else if ( track.option.type === 'input' ) {
      track.source?.disconnect(this.destination);
      delete track.source;
      delete track.stream;
    }
    console.log('22222', id)
    this.delete(id);    
  }

  toArray() {
    return Array.from(this.values());
  }

}

const context = new LiveContext();

export function useLiveContext() {
	return context;
}