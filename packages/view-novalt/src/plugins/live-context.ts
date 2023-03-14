import { getDevices, getFileSystem, getRecordChunk, getRecordStatus, pushLiveChunk, recordStart, recordStop } from "@sopia-bot/bridge";

const fs = getFileSystem();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  id: number;
};
export type TrackOutputOption = {
  type: 'output';
  trackName: string;
};

export type TrackOption = TrackFileOption|TrackInputOption;
export type TrackItem = {
  uid: string;
  status: string;
  option: TrackOption;
	context?: OfflineAudioContext|AudioContext;
	buffer?: ArrayBuffer;
	audioBuffer?: AudioBufferSourceNode;
  stream?: MediaStream;
  source?: MediaStreamAudioSourceNode;
  inputStream?: InputStream;
}

class InputStream {
  private timeslice: number = 5000;
  private devices: any[] = [];
  private tout: NodeJS.Timer|number|null = null;
  private running = false;
  private uuid: string;

  constructor(private uid: string, private option: TrackInputOption) {
    this.uuid = crypto.randomUUID();
  }

  async progress() {
    while ( this.running ) {

    }
  }

  async start(callback: (chunk: Buffer) => void,timeslice: number = 5000) {
    this.timeslice = timeslice;
    if ( this.devices.length === 0 ) {
      this.devices = await getDevices();
    }
    const device = this.devices.find(d => d.id === this.option.id);
    if ( !device ) return;

    await recordStart({
      uid: this.uid,
      deviceName: device.name,
      smapleRate: 48000,
      channels: 2,
      bitDepth: 32,
    });
    setTimeout(async () => {
      while ( this.running ) {
        const chunk = await getRecordChunk(this.uid);
        console.log('chunk', this.uuid);
        callback(chunk);
        await sleep(this.timeslice);
      }
    }, this.timeslice);
    this.running = true;
  }

  async stop() {
    if ( this.running ) {
      this.running = false;
    }
  }
}

export class LiveContext extends Map<string, TrackItem> {
	private mainContext = new AudioContext();
	private destination = this.mainContext.createMediaStreamDestination();
	private recorder = new MediaRecorder(this.destination.stream, { mimeType: 'audio/webm;codecs=opus' });
  private status = 'ready';

	constructor() {
		super();
		this.recorder.addEventListener('dataavailable', async (evt: BlobEvent) => {
			const buffer = Buffer.from(await evt.data.arrayBuffer())
			await pushLiveChunk(buffer);
		});
	}

  private trackStart(track: TrackItem) {
    if ( track.status !== 'ready' ) return;
    track.status = 'progress';

    if ( track.option.type === 'file' ) {
      track.audioBuffer?.start();
    } else if ( track.option.type === 'input' ) {
      track.inputStream?.start(async (chunk: Buffer) => {
        if ( chunk.length > 0 ) {
          track.audioBuffer = this.mainContext.createBufferSource();
          track.audioBuffer.buffer = await this.mainContext.decodeAudioData(chunk.buffer);
          track.audioBuffer.connect(this.destination);
          track.audioBuffer.start();
        }
      }, 1000);
    }
  }

	start(timeslice = 1000) {
    if ( this.status !== 'ready' ) return;
		this.recorder.start(timeslice);
		for ( const track of this.values() ) {
			this.trackStart.call(this, track);
		}
    this.status = 'progress';
	}

  stop() {
    this.recorder.stop();
    for ( const track of this.values() ) {
			this.stopTrack(track.uid);
		}
    this.status = 'ready';
  }

	async addTrack(option: TrackOption): Promise<TrackItem> {
		const uid = crypto.randomUUID();
		if ( this.has(uid) ) return this.addTrack(option); // 중복 방지
		return await this.setTrack(uid, option);
	}

	async setTrack(id: string, option: TrackOption): Promise<TrackItem> {
    const item: TrackItem = this.get(id) || {
      uid: id,
      status: 'ready',
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
      item.inputStream || (item.inputStream = new InputStream(item.uid, option));
    }
		this.set(id, item);

    if ( this.status === 'progress' ) {
      this.trackStart.call(this, item);
    }

		return item;
	}

  async stopTrack(id: string): Promise<void> {
    const track = this.get(id);
    if ( !track ) return;
    
    if ( track.option.type === 'file' ) {
      track.audioBuffer?.stop();
    } else if ( track.option.type === 'input' ) {
      recordStop(id);
      track.inputStream?.stop();
    }
    track.status = 'ready';
  }

  async deleteTrack(id: string): Promise<void> {
    const track = this.get(id);
    if ( !track ) return;
    await this.stopTrack(id);
    if ( track.option.type === 'file' ) {
      track.audioBuffer?.disconnect(this.destination);
      delete track.audioBuffer;
      delete track.context;
      delete track.buffer;
    } else if ( track.option.type === 'input' ) {
      track.source?.disconnect(this.destination);
      delete track.source;
      delete track.stream;
    }
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