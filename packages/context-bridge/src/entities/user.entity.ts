import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class UserEntity {
	@PrimaryGeneratedColumn()
	primary!: string;

	@Column()
	token!: string; // spoon token

	@Column()
	refresh_token!: string; // spoon refresh token

	@Column()
	name!: string;

	@Column()
	id!: string;

	@Column()
	spoon_id!: string;

	@Column()
	user_id!: number; // sopia user id
}
