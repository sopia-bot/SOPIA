import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/db/entities/user.entity';

@Module({
  controllers: [ConfigController],
  providers: [ConfigService],
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
    ])
  ]
})
export class ConfigModule {}
