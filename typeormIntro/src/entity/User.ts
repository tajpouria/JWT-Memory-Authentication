import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
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
}
