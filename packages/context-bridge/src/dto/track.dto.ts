import { TrackEntity } from "../entities";

export interface AddTrackDto extends TrackEntity {

}

export interface SetTrackDto extends TrackEntity {

}

export interface DeleteTrackDto extends Pick<TrackEntity, 'uid'> {

}