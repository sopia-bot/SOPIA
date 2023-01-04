import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

@Controller()
export class TestController {
  constructor(private readonly testService: TestService) {}

  @MessagePattern('/create/:hi')
  create(@Payload() createTestDto: CreateTestDto) {
    console.log(createTestDto);
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
