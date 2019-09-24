import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

Entity();
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
