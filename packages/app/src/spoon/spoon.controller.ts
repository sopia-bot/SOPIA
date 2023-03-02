import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SpoonService } from './spoon.service';
import { LoginService } from './login.service';
import { ApiLivesCreate, LogonUser, SpoonClient } from '@sopia-bot/core';
import { LiveService } from './live.service';

@Controller()
export class SpoonController {
  constructor(
    private readonly spoonService: SpoonService,
    private readonly loginService: LoginService,
    private readonly liveService: LiveService,
    @Inject('SpoonClient') private spoon: SpoonClient,
  ) {}

  @MessagePattern('/spoon/sns-login-open')
  snsLoginOpen(@Payload('data') url: string) {
    return this.loginService.snsLoginOpen(url);
  }

  @MessagePattern('/spoon/user/set')
  setUser(@Payload('data') user: LogonUser) {
    this.spoon.loginToken(user.id, user.token);
    return this.spoonService.setUser(user);
  }

  @MessagePattern('/spoon/user/get')
  getUser() {
    return this.spoonService.getUser();
  }

  @MessagePattern('/spoon/live/create')
  createLive(@Payload('data') prop: ApiLivesCreate.Request) {
    return this.liveService.create(prop);
  }

  @MessagePattern('/spoon/live/setting')
  settingLive(@Payload('data') url: string) {
    return this.liveService.setting(url);
  }

  @MessagePattern('/spoon/live/close')
  closeLive() {
    return this.liveService.close();
  }

  @MessagePattern('/spoon/live/push')
  pushLiveChunk(@Payload('data') chunk: Buffer) {
    return this.liveService.push(chunk);
  }

}
