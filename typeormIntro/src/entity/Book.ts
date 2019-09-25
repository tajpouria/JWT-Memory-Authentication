import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from "typeorm";

import { Author } from "./Author";
import { AuthorBook } from "./AuthorBook";

@Entity()
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => AuthorBook, ab => ab.book)
  authorConnection: Author;
}
