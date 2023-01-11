import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SpoonService } from './spoon.service';
import { LoginService } from './login.service';
import { LogonUser, SpoonClient } from '@sopia-bot/core';

@Controller()
export class SpoonController {
  constructor(
    private readonly spoonService: SpoonService,
    private readonly loginService: LoginService,
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
}
