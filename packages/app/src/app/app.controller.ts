import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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

}
