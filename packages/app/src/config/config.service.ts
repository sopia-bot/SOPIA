import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, LiveSettingEntity, StreamSettingEntity, TrackEntity, RecordSettingEntity } from '@sopia-bot/bridge/dist/entities';
import { Repository } from 'typeorm';
import { SetUserDto, SetLiveSettingDto, SetStreamDto, AddTrackDto, SetTrackDto, DeleteTrackDto, SetRecordDto } from '@sopia-bot/bridge/dist/dto';

@Injectable()
export class ConfigService {

	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(LiveSettingEntity) private liveSettingRepository: Repository<LiveSettingEntity>,
		@InjectRepository(StreamSettingEntity) private streamSettingRepository: Repository<StreamSettingEntity>,
    @InjectRepository(TrackEntity) private trackRepository: Repository<TrackEntity>,
    @InjectRepository(RecordSettingEntity) private recordSettingRepository: Repository<RecordSettingEntity>,
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

  async getTrackList() {
    return (await this.trackRepository.find()) || [];
  }

  async addTrack(track: AddTrackDto) {
    const oldTrack = await this.trackRepository.findOne({ where: { uid: track.uid } });

    if ( oldTrack ) {
      throw new Error('Exists track');
    }

    console.log('Adding track', track);

    const newTrack = new TrackEntity();
    newTrack.uid = track.uid;
    newTrack.type = track.type;
    newTrack.trackName = track.trackName;
    newTrack.mute = track.mute;
    if ( track.type === 'file' ) {
      newTrack.filePath = track.filePath;
    } else if ( track.type === 'input' ) {
      newTrack.deviceId = track.deviceId;
      newTrack.id = track.id;
    }

    return this.trackRepository.save(newTrack);
  }

  async setTrack(track: SetTrackDto) {
    const oldTrack = await this.trackRepository.findOne({
      where: {
        uid: track.uid,
      },
    });

    if ( !oldTrack ) {
      return this.addTrack(track);
    }
    
    oldTrack.type = track.type;
    oldTrack.trackName = track.trackName;
    oldTrack.mute = track.mute;
    if ( track.type === 'file' ) {
      oldTrack.filePath = track.filePath;
    } else if ( track.type === 'input' ) {
      oldTrack.deviceId = track.deviceId;
      oldTrack.id = track.id;
    }

    return this.trackRepository.save(oldTrack);
  }

  async deleteTrack(track: DeleteTrackDto) {
    await this.trackRepository.delete({
      uid: track.uid,
    });
  }

  async getRecordSetting() {
    return (await this.recordSettingRepository.find())[0];
  }

  async setRecordSetting(recordInfo: SetRecordDto) {
		const setting = (await this.getRecordSetting()) || new RecordSettingEntity();

		setting.args = recordInfo.args;
		setting.command = recordInfo.command;

		return this.recordSettingRepository.save(setting);
	}

}