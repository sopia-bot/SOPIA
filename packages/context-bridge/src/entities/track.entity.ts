import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class TrackEntity {
  @PrimaryGeneratedColumn()
  primary!: number;

  @Column()
  name!: string;

  @Column()
  filePath!: string;

}
