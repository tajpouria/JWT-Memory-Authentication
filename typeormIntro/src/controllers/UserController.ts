import { Response, Request } from "express";

import { get, post, put, _delete, controller } from "./decorators";
import { User } from "../entity/User";
import { bodyValidator } from "./decorators/bodyValidator";
import { use } from "./decorators/use";

@controller("/api/user")
export class UserController {
  @get("/")
  async getUsers(req: Request, res: Response) {
    const users = await User.find();
    res.send(users);
  }

  @get("/:id")
  async getUserById(req: Request, res: Response) {
    const user = await User.findByIds([req.params.id]);
    res.send(user);
  }

  @post("/")
  @bodyValidator(["firstName", "lastName", "email", "age"])
  async createUser(req: Request, res: Response) {
    await User.create(req.body).save();
    res.send(req.body);
  }

  @put("/:id")
  @bodyValidator([])
  async updateUser(req: Request, res: Response) {
    await User.update(req.params.id, req.body);
    // await User.update({ firstName: req.body.firstName }, req.body);

    res.json({ success: true });
  }

  @_delete("/:id")
  async deleteUser(req: Request, res: Response) {
    const user = await User.findByIds([req.params.id]);
    await User.remove(user);
    res.json({ success: true });
  }
}
