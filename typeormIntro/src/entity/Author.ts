import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from "typeorm";

import { Book } from "./Book";
import { AuthorBook } from "./AuthorBook";

Entity();
export class Author extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => AuthorBook, ab => ab.author)
  bookConnection: Book;
}
