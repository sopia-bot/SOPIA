import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import { SetUserDto } from './dto/user.dto';

@Injectable()
export class ConfigService {

	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
	) {}

	getUser() {
		return this.userRepository.findOne({});
	}

	async setUser(userInfo: SetUserDto) {
		const user = await this.userRepository.findOne({}) || new UserEntity();
		
		user.user_id = userInfo.user_id;
		user.name = userInfo.name;
		user.refresh_token = userInfo.refresh_token;
		user.token = userInfo.token;
		user.spoon_id = userInfo.spoon_id;

		return this.userRepository.save(user);
	}
}