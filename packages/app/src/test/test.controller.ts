import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { BrowserWindow } from 'electron';

@Controller()
export class TestController {
  constructor(
    private readonly testService: TestService,
    @Inject('BrowserWindow') private readonly browserWindow: BrowserWindow) {}

  @MessagePattern('/create/:hi')
  create(@Payload() createTestDto: CreateTestDto) {
    console.log(this.browserWindow);
    return this.testService.create(createTestDto);
  }

  @MessagePattern('findAllTest')
  findAll() {
    return this.testService.findAll();
  }

  @MessagePattern('findOneTest')
  findOne(@Payload() id: number) {
    return this.testService.findOne(id);
  }

  @MessagePattern('updateTest')
  update(@Payload() updateTestDto: UpdateTestDto) {
    return this.testService.update(updateTestDto.id, updateTestDto);
  }

  @MessagePattern('removeTest')
  remove(@Payload() id: number) {
    return this.testService.remove(id);
  }
}
