import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, LiveSettingEntity } from '@sopia-bot/bridge/dist/entities';
import { Repository } from 'typeorm';
import { SetUserDto, SetLiveSettingDto } from '@sopia-bot/bridge/dist/dto';

@Injectable()
export class ConfigService {

	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(LiveSettingEntity) private liveSettingRepository: Repository<LiveSettingEntity>,
	) {}

	async getUser() {
		return (await this.userRepository.find())[0];
	}

	async setUser(userInfo: SetUserDto) {
		const user = (await this.getUser()) || new UserEntity();
		
    user.id = userInfo.id;
		user.user_id = userInfo.user_id;
		user.name = userInfo.name;
		user.refresh_token = userInfo.refresh_token;
		user.token = userInfo.token;
		user.spoon_id = userInfo.spoon_id;

		return this.userRepository.save(user);
	}

	async getLiveSetting() {
		return (await this.liveSettingRepository.find())[0];
	}

	async setLiveSetting(liveInfo: SetLiveSettingDto) {
		const setting = (await this.getLiveSetting()) || new LiveSettingEntity();

		setting.title = liveInfo.title;
		setting.welcome_message = liveInfo.welcome_message;
		setting.tags = liveInfo.tags;
		setting.categories = liveInfo.categories;
		setting.spoon_aim = liveInfo.spoon_aim;
		if ( liveInfo.image ) {
			setting.image = liveInfo.image;
		}

		return this.liveSettingRepository.save(setting);
	}
}