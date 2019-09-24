import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn,
  OneToMany
} from "typeorm";

import { Profile } from "./Profile";
import { Photo } from "./Photo";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50 })
  firstName: string;

  @OneToOne(type => Profile)
  @JoinColumn()
  profile: Profile;

  @OneToMany(type => Photo, photo => photo.user)
  photos: Photo[];
}
