import { StreamSettingEntity } from "../../entities";

export interface SetStreamDto extends Omit<StreamSettingEntity, 'primary'> {

}