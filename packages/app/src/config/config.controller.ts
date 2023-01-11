import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConfigService } from './config.service';
import { SetUserDto } from '@sopia-bot/bridge/dist/dto';

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
}
