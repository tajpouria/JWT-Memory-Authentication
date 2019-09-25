import {
  BaseEntity,
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";

import { Author } from "./Author";
import { Book } from "./Book";

Entity();
export class AuthorBook extends BaseEntity {
  @PrimaryColumn()
  authorId: number;

  @PrimaryColumn()
  bookId: number;

  @ManyToOne(() => Author, author => author.bookConnection, { primary: true })
  @JoinColumn({ name: "bookId" })
  author: Author;

  @ManyToOne(() => Book, book => book.authorConnection, { primary: true })
  @JoinColumn({ name: "bookid" })
  book: Book;
}
