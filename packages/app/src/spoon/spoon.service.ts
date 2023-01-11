import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SpoonUserEntity } from '@sopia-bot/bridge/dist/entities';
import { SetSpoonUserDto } from '@sopia-bot/bridge/dist/dto';
import { Repository } from 'typeorm';

@Injectable()
export class SpoonService {
	constructor(
		@InjectRepository(SpoonUserEntity) private userRepository: Repository<SpoonUserEntity>
	) {}

	async getUser() {
		return (await this.userRepository.find())[0];
	}

	async setUser(userInfo: SetSpoonUserDto) {
		const user = (await this.getUser()) || new SpoonUserEntity();
		
    user.id = userInfo.id;
		user.refresh_token = userInfo.refresh_token;
		user.token = userInfo.token;
		user.tag = userInfo.tag;
		user.grants = userInfo.grants;
		user.nickname = userInfo.nickname;

		return this.userRepository.save(user);
	}
}
