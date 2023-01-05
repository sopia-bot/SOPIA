import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SpoonService } from './spoon.service';
import { LoginService } from './login.service';

@Controller()
export class SpoonController {
  constructor(
    private readonly spoonService: SpoonService,
    private readonly loginService: LoginService
  ) {}

  @MessagePattern('/spoon/sns-login-open')
  snsLoginOpen(@Payload('data') url: string) {
    return this.loginService.snsLoginOpen(url);
  }
}
