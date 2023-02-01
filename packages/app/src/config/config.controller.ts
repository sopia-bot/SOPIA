import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConfigService } from './config.service';
import { SetLiveSettingDto, SetStreamDto, SetUserDto } from '@sopia-bot/bridge/dist/dto';

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

}
