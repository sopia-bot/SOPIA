import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class SpoonUser {
	@PrimaryGeneratedColumn()
	id!: string;

	@Column()
	token!: string;

	@Column()
	refresh_token!: string;

	@Column()
	nickname!: string;
}
