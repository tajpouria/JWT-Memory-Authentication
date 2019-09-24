import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
 
} from "typeorm";

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  favoriteColor: string;
}
