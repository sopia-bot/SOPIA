import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConfigService } from './config.service';
import { AddTrackDto, DeleteTrackDto, SetLiveSettingDto, SetRecordDto, SetStreamDto, SetTrackDto, SetUserDto } from '@sopia-bot/bridge/dist/dto';

@Controller()
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @MessagePattern('/config/user/get')
  getUser() {
    return this.configService.getUser();
  }

  @MessagePattern('/config/user/set')
  setUser(@Payload('data') user: SetUserDto) {
    return this.configService.setUser(user);
  }

  @MessagePattern('/config/live/get')
  getLiveSetting() {
    return this.configService.getLiveSetting();
  }

  @MessagePattern('/config/live/set')
  setLiveSetting(@Payload('data') liveSetting: SetLiveSettingDto) {
    return this.configService.setLiveSetting(liveSetting);
  }

  @MessagePattern('/config/stream/get')
  getStreamSetting() {
    return this.configService.getStreamSetting();
  }

  @MessagePattern('/config/stream/set')
  setStreamSetting(@Payload('data') streamSetting: SetStreamDto) {
    return this.configService.setStreamSetting(streamSetting);
  }

  @MessagePattern('/config/track/get')
  getTrackList() {
    return this.configService.getTrackList();
  }

  @MessagePattern('/config/track/add')
  addTrack(@Payload('data') track: AddTrackDto) {
    return this.configService.addTrack(track);
  }

  @MessagePattern('/config/track/set')
  setTrack(@Payload('data') track: SetTrackDto) {
    return this.configService.setTrack(track);
  }

  @MessagePattern('/config/track/delete')
  deleteTrack(@Payload('data') track: DeleteTrackDto) {
    return this.configService.deleteTrack(track);
  }

  @MessagePattern('/config/record/get')
  getRecordSetting() {
    return this.configService.getRecordSetting();
  }

  @MessagePattern('/config/record/set')
  setRecordSetting(@Payload('data') recordInfo: SetRecordDto) {
    return this.configService.setRecordSetting(recordInfo);
  }

}
