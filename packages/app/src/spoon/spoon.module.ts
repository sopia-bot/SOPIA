import { Module } from '@nestjs/common';
import { SpoonService } from './spoon.service';
import { SpoonController } from './spoon.controller';
import { LoginService } from './login.service';

@Module({
  controllers: [SpoonController],
  providers: [SpoonService, LoginService]
})
export class SpoonModule {}
