import { RecordSettingEntity } from "../../entities";

export interface SetRecordDto extends Omit<RecordSettingEntity, 'primary'> {

}