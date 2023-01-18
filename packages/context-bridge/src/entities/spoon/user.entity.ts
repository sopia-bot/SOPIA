import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm";
import { Grants, LogonUser } from "@sopia-bot/core";
import { jsonTransformer } from "../../utils";

@Entity()
export class SpoonUserEntity
	implements Pick<LogonUser, 'id' | 'token' | 'refresh_token' | 'tag' | 'nickname' | 'grants'> {
	@PrimaryColumn()
	id!: number;

	@Column()
	token!: string; // spoon token

	@Column()
	refresh_token!: string; // spoon refresh token

	@Column()
	nickname!: string;

	@Column()
	tag!: string;

	@Column({
		type: 'varchar',
		length: 255,
		transformer: jsonTransformer,
	})
	grants!: Grants; // sopia user id
}
