import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class StreamSettingEntity {
  @PrimaryGeneratedColumn()
  primary!: number;

  @Column()
  command!: string;

  @Column()
  args!: string;
}
