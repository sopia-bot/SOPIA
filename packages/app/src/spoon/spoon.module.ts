import { Module } from '@nestjs/common';
import { SpoonService } from './spoon.service';
import { SpoonController } from './spoon.controller';
import { LoginService } from './login.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpoonUserEntity } from '@sopia-bot/bridge/dist/entities';

@Module({
  controllers: [SpoonController],
  providers: [SpoonService, LoginService],
  imports: [
    TypeOrmModule.forFeature([
      SpoonUserEntity,
    ])
  ]
})
export class SpoonModule {}
