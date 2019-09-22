import { Request, Response } from "express";

import { get, controller } from "./decorators";

@controller("")
export class RootController {
  @get("/")
  getRoot(req: Request, res: Response) {
    res.send("<h1>TypeORM Introduction</h1>");
  }
}
