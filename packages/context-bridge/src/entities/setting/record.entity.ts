import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class RecordSettingEntity {
  @PrimaryGeneratedColumn()
  primary!: number;

  @Column()
  command!: string;

  @Column()
  args!: string;
}
