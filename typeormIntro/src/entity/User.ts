import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn
} from "typeorm";

import { Profile } from "./Profile";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50 })
  firstName: string;

  @Column({ type: "varchar", length: 50 })
  lastName: string;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "bool", default: false })
  confirmed: boolean;

  @Column("int")
  age: number;

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;
}
