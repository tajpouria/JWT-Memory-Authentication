import "reflect-metadata";
import express from "express";
import * as bodyParser from "body-parser";
import { createConnection } from "typeorm";

import { AppRouter } from "./routes/AppRouter";

import "./controllers/RootController";
import "./controllers/UserController";

createConnection()
  .then(async connection => {
    const app = express();

    app.use(bodyParser.json());

    const port = 4000;
    app.listen(port, () => {
      console.info(`Listening on port ${port}...`);

      app.use(AppRouter.instance);
    });
  })
  .catch(err => console.error(err));
