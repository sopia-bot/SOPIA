import { Module } from '@nestjs/common';
import { DialogService } from './dialog.service';
import { DialogController } from './dialog.controller';

@Module({
  controllers: [DialogController],
  providers: [DialogService]
})
export class DialogModule {}
