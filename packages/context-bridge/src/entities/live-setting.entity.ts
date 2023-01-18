import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { jsonTransformer } from "../utils";

@Entity()
export class LiveSettingEntity {
	@PrimaryGeneratedColumn()
	primary!: string;

	@Column()
	title!: string;

	@Column()
	welcome_message!: string;
	
	@Column({
		type: 'varchar',
		length: 255,
		transformer: jsonTransformer,
	})
	tags!: string[];

	@Column({
		type: 'varchar',
		length: 255,
		transformer: jsonTransformer,
	})
	categories!: string[];

	@Column({
		type: 'varchar',
		length: 255,
		transformer: jsonTransformer,
	})
	spoon_aim!: { title: string, count: number }[];

	@Column({
		type: 'blob',
		transformer: {
			to: (value: string) => Buffer.from(value || '', 'utf-8'),
			from: (value: Buffer) => value.toString(),
		},
	})
	image!: Buffer;

}
