import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { RecordingService } from './recording.provider';
import { ConfigModule } from '../config/config.module';

@Module({
  controllers: [AppController],
  providers: [AppService, RecordingService],
  imports: [ConfigModule]
})
export class AppModule {}
