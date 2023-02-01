import { TrackEntity } from "../entities";

export interface SetTrackDto extends Omit<TrackEntity, 'primary'> {

}