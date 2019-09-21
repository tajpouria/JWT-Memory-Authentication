### Type ORM

provides great features that helps us to develop any kind of application that uses database.

### setup TypeOrm

> npm i -g typeorm

> typeorm init --name server --database postgress

ormconfig.json

```json
{
  "type": "postgres",
  "host": "localhost",
  "username": "postgres",
  "password": "postgres",
  "port": 5432,
  "database": "jwt-memory-auth",
  "synchronize": true,
  "logging": false,
  "entities": ["src/entity/**/*.ts"],
  "migrations": ["src/migration/**/*.ts"],
  "subscribers": ["src/subscriber/**/*.ts"],
  "cli": {
    "entitiesDir": "src/entity",
    "migrationsDir": "src/migration",
    "subscribersDir": "src/subscriber"
  }
}
```

### introduction to typorm

create Entity

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("tableName")
export class User {
  @PrimaryGeneratedColumn
  id: number;

  @Column({ type: "varchar", length: 50 })
  firstName: string;

  @Column({ type: "varchar", length: 50 })
  lastName: string;

  @Column({ type: "bool", default: false })
  confirmed: boolean;

  @Column("int")
  age: number;
}
```

create connection

```typescript
import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";

createConnection()
  .then(async connection => {
    const user = new User();
    user.firstName = "John";
    user.lastName = "Deo";
    user.age = 40;
    user.email = "hello@gmail.com";

    await connection.manager.save(user);

    const users = await connection.manager.find(User);
  })
  .catch(err => console.err(err));
```

CRUD in typeorm

> yarn start

### setup graphql with express

> yarn add graphql apollo-server-express
> yarn -D @types/graphql

## Interesting Stuff

### preferred tsconfig

> npx tscofig

### upgrade packages

> yarn upgrade-interactive --latest

### postgres

DROP DATABASE already accessing by other users:

> sudo /etc/init.d/postgresql stop
> sudo /etc/init.d/postgresql start
