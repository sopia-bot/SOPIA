import { Controller } from '@nestjs/common';
import { UtilsService } from './utils.service';

@Controller()
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}
}
