import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm";

@Entity()
export class TrackEntity {
  @PrimaryColumn()
  uid!: string;

  @Column()
  type!: 'file'|'input';

  @Column()
  trackName!: string;

  @Column({ nullable: true })
  filePath?: string;

  @Column({ nullable: true })
  deviceId?: string;

  @Column({ nullable: true })
  id?: number;

  @Column()
  mute!: boolean;

}
