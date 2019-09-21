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

    console.log(users);
  })
  .catch(err => console.error(err));
