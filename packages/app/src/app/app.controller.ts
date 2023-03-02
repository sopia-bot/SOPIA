import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RecordingService } from './recording.provider';
import { RecordStartDto } from '@sopia-bot/bridge/dist/dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly recordingService: RecordingService
  ) {}

  @MessagePattern('/app/minimize')
  minimize() {
    return this.appService.minimize();
  }

  @MessagePattern('/app/maximize')
  maximize() {
    return this.appService.maximize();
  }

  @MessagePattern('/app/toggle-maximize')
  toggleMaximize() {
    return this.appService.toggleMaximize();
  }

  @MessagePattern('/app/quit')
  quit() {
    return this.appService.quit();
  }

  @MessagePattern('/app/version')
  version() {
    return this.appService.version();
  }

  @MessagePattern('/app/record/devices')
  getDevices() {
    return this.recordingService.getDevices();
  }

  @MessagePattern('/app/record/start')
  startRecording(@Payload('data') option: RecordStartDto) {
    return this.recordingService.startRecording(option);
  }

  @MessagePattern('/app/record/status')
  recordingStatus(@Payload('data') uid: string) {
    return this.recordingService.recordingStatus(uid);
  }

  @MessagePattern('/app/record/get')
  getRecordChunk(@Payload('data') uid: string) {
    return this.recordingService.getRecordChunk(uid);
  }

  @MessagePattern('/app/record/stop')
  stopRecording(@Payload('data') uid: string) {
    return this.recordingService.stopRecording(uid);
  }

  @MessagePattern('/app/record/list')
  getAllRecorder() {
    return this.recordingService.getAllRecorder();
  }

}
