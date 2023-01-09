import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@sopia-bot/bridge/dist/entities';
import { Repository } from 'typeorm';
import { SetUserDto } from '@sopia-bot/bridge/dist/dto';

@Injectable()
export class ConfigService {

	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
	) {}

	async getUser() {
		return (await this.userRepository.find())[0];
	}

	async setUser(userInfo: SetUserDto) {
		const user = (await this.getUser()) || new UserEntity();
		
    console.log('recive', userInfo)
    user.id = userInfo.id;
		user.user_id = userInfo.user_id;
		user.name = userInfo.name;
		user.refresh_token = userInfo.refresh_token;
		user.token = userInfo.token;
		user.spoon_id = userInfo.spoon_id;

		return this.userRepository.save(user);
	}
}