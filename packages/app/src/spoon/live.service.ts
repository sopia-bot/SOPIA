import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SpoonUserEntity } from '@sopia-bot/bridge/dist/entities';
import { Repository } from 'typeorm';
import { ApiLivesCreate } from '@sopia-bot/core';
import { SpoonWrapper } from './client.provider';

@Injectable()
export class LiveService {
	constructor(
		@InjectRepository(SpoonUserEntity) private userRepository: Repository<SpoonUserEntity>,
		@Inject('SpoonClient') private spoon: SpoonWrapper,
	) {}

	async create(requestProp: ApiLivesCreate.Request) {
		return await this.spoon.createLive(requestProp);
	}

}
