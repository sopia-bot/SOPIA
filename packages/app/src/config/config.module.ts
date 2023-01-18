import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, LiveSettingEntity } from '@sopia-bot/bridge/dist/entities';

@Module({
  controllers: [ConfigController],
  providers: [ConfigService],
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      LiveSettingEntity,
    ])
  ]
})
export class ConfigModule {}
