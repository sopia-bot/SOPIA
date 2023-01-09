export interface SetUserDto {
	token: string; // spoon token

	refresh_token: string; // spoon refresh token

	name: string;

	id: string;

	spoon_id: string;

	user_id: number; // sopia user id
}