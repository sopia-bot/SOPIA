
export interface RecordStartDto {
  [key: string]: any;
  uid: string;
  deviceName?: string;
  channels?: number;
  smapleRate?: number;
  bitDepth?: number;
}