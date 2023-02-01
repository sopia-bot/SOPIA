import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OpenDialogOptions, SaveDialogOptions } from 'electron';
import { DialogService } from './dialog.service';

@Controller()
export class DialogController {
  constructor(private readonly dialogService: DialogService) {}

  @MessagePattern('/dialog/open')
  showOpenDialog(@Payload('data') options: OpenDialogOptions) {
    return this.dialogService.showOpenDialog(options);
  }

  @MessagePattern('/dialog/save')
  showSaveDialog(@Payload('data') options: SaveDialogOptions) {
    return this.dialogService.showSaveDialog(options);
  }

}
