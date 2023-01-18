export interface SetLiveSettingDto {
	title: string;
	welcome_message: string;
	tags: string[];
	categories: string[];
	spoon_aim: { title: string, count: number }[];
	image?: Buffer;
}