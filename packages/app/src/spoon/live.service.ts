import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SpoonUserEntity, StreamSettingEntity } from '@sopia-bot/bridge/dist/entities';
import { Repository } from 'typeorm';
import { ApiLivesCreate } from '@sopia-bot/core';
import { SpoonWrapper } from './client.provider';

@Injectable()
export class LiveService {
	constructor(
		@InjectRepository(SpoonUserEntity) private userRepository: Repository<SpoonUserEntity>,
		@InjectRepository(StreamSettingEntity) private streamSettingRepository: Repository<StreamSettingEntity>,
		@Inject('SpoonClient') private spoon: SpoonWrapper,
	) {}

	async create(requestProp: ApiLivesCreate.Request) {
		const [streamSetting] = await this.streamSettingRepository.find();
		return await this.spoon.createLive(requestProp, streamSetting);
	}

	push(chunk: Buffer) {
		return this.spoon.push(chunk);
	}

}
