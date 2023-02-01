import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, LiveSettingEntity, StreamSettingEntity } from '@sopia-bot/bridge/dist/entities';
import { Repository } from 'typeorm';
import { SetUserDto, SetLiveSettingDto, SetStreamDto } from '@sopia-bot/bridge/dist/dto';

@Injectable()
export class ConfigService {

	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(LiveSettingEntity) private liveSettingRepository: Repository<LiveSettingEntity>,
		@InjectRepository(StreamSettingEntity) private streamSettingRepository: Repository<StreamSettingEntity>,
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
		setting.image = Buffer.from(liveInfo.image || '');

		return this.liveSettingRepository.save(setting);
	}

	async getStreamSetting() {
		return (await this.streamSettingRepository.find())[0];
	}

	async setStreamSetting(streamInfo: SetStreamDto) {
		const setting = (await this.getStreamSetting()) || new StreamSettingEntity();

		setting.args = streamInfo.args;
		setting.command = streamInfo.command;

		return this.streamSettingRepository.save(setting);
	}
}