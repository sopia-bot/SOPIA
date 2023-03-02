import { Injectable } from '@nestjs/common';
import { getDevices } from 'naudiodon';
import { ConfigService } from '../config/config.service';
import { ChildProcess, spawn } from 'child_process';
import { RecordStartDto } from '@sopia-bot/bridge/dist/dto';

function buildWaveFormat(channels: number, sampleRate: number, bitDepth: number, data: Buffer) {
  const headerLength = 44;
  const fileSize = data.length + headerLength - 8;
  let offset = 0;
  const header = Buffer.alloc(headerLength);

  // RIFF Chunk Descriptor
  offset = header.write('RIFF');
  offset = header.writeUInt32LE(fileSize, offset);
  offset += header.write('WAVE', offset);

  // Format Chunk Descriptor
  offset += header.write('fmt ', offset);
  offset = header.writeUInt32LE(16, offset);  // Sub-chunk Size
  offset = header.writeUInt16LE(1, offset);   // Audio Format: 1 = PCM
  offset = header.writeUInt16LE(channels, offset);
  offset = header.writeUInt32LE(sampleRate, offset);
  offset = header.writeUInt32LE(sampleRate * channels * bitDepth / 8, offset);  // Byte Rate
  offset = header.writeUInt16LE(channels * bitDepth / 8, offset);  // Block Align
  offset = header.writeUInt16LE(bitDepth, offset);

  // Data Chunk Descriptor
  offset += header.write('data', offset);
  offset = header.writeUInt32LE(data.length, offset);
  return Buffer.concat([header, data]);
}

class AudioRecorder {
  private option = {
    deviceName: '',
    channels: 0,
    sampleRate: 0,
    bitDepth: 0,
    command: '',
    arguments: '',
  };
  private recordProcess: ChildProcess|null = null;
  private audioChunk: Buffer = Buffer.from([]);
  public status = 'ready';

  deviceName(value: string) {
    this.option.deviceName = value;
    return this;
  }

  channels(value: number) {
    this.option.channels = value;
    return this;
  }

  sampleRate(value: number) {
    this.option.sampleRate = value;
    return this;
  }

  bitDepth(value: number) {
    this.option.bitDepth = value;
    return this;
  }

  command(value: string) {
    this.option.command = value;
    return this;
  }

  arguments(value: string) {
    this.option.arguments = value;
    return this;
  }

  get parsedArguments() {
    return this.option.arguments.split(' ')
    .map((value) => value.replace(/\${(\w+?)}/, (m, key: string) => (this.option as any)[key]))
  }

  async start() {
    if ( this.status !== 'ready' ) {
      console.log(`[RECORDING] In progress recording...`);
      return;
    }
    this.recordProcess = spawn(this.option.command, this.parsedArguments);
    this.recordProcess.stdout?.on('data', (data: Buffer) => {
      //console.log(data);
      if ( data.includes(Buffer.from('.SoX')) ) {
        return
      };
      if ( this.audioChunk ) {
        this.audioChunk = Buffer.concat([this.audioChunk, data]);
      } else {
        this.audioChunk = data;
      }
    });
    this.recordProcess.stderr?.on('data', (data: Buffer) => {
      //console.log('[🚫RECORDERR] ', data);
    });
    this.recordProcess.on('exit', () => {
      console.log('disconnected recorder exit');
    });
    this.recordProcess.on('close', () => {
      console.log('disconnected recorder close');
    });
    this.recordProcess.on('error', () => {
      console.log('disconnected recorder error');
    });
    this.recordProcess.on('disconnect', () => {
      console.log('disconnected recorder disconnect');
    });
    console.log('[RECORDING]', `${this.option.command} ${this.parsedArguments.join(' ')}`);
    this.status = 'recording';
  }

  async getAudioChunk() {
    if ( this.status !== 'recording' ) return;
    if ( this.audioChunk.length <= 0 ) return Buffer.from([]);
    const copyedBuffer = Buffer.allocUnsafe(this.audioChunk.length);
    this.audioChunk.copy(copyedBuffer, 0, 0, this.audioChunk.length);
    this.audioChunk = Buffer.from([]);
    const chunk = buildWaveFormat(this.option.channels, this.option.sampleRate, this.option.bitDepth, copyedBuffer);
    console.log('[RECORDING] chunk', chunk);
    return chunk;
  }

  async stop() {
    if ( this.status !== 'recording' ) return;
    this.status = 'stop';
    this.recordProcess?.kill();
    this.recordProcess = null;
    this.audioChunk = Buffer.from([]);
    this.status = 'ready';
    return true;
  }

  toJSON() {
    return {
      option: this.option,
      status: this.status,
      command: `${this.option.command} ${this.parsedArguments.join(' ')}`,
    };
  }
}

@Injectable()
export class RecordingService {

  private recorderMap = new Map<string, AudioRecorder>();

  constructor(
    private configService: ConfigService,
  ) {}

  async getDevices() {
    return (await getDevices());
  }

  async getAllRecorder() {
    return Array.from(this.recorderMap.entries())
      .map(([uid, recorder]) => ({
        uid,
        ...recorder.toJSON(),
      }));
  }

  async startRecording(option: RecordStartDto) {
    if ( !this.recorderMap.has(option.uid) ) {
      const setting = await this.configService.getRecordSetting();
      this.recorderMap.set(option.uid, new AudioRecorder()
        .command(setting.command)
        .arguments(setting.args)
        .bitDepth(option.bitDepth || 16)
        .deviceName(option.deviceName || '-d')
        .channels(option.channels || 1)
        .sampleRate(option.sampleRate || 44100)
      );
    }

    const recorder = this.recorderMap.get(option.uid) as AudioRecorder;
    recorder.start();
    return;
  }

  recordingStatus(uid: string) {
    return this.recorderMap.get(uid)?.status || 'unknown';
  }

  getRecordChunk(uid: string) {
    return this.recorderMap.get(uid)?.getAudioChunk();
  }

  async stopRecording(uid: string) {
    const recorder = this.recorderMap.get(uid);
    if ( !recorder ) return;
    recorder.stop();
  }

}
