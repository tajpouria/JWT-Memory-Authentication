import { Response, Request } from "express";

import { get, post, put, _delete, controller } from "./decorators";
import { User } from "../entity/User";
import { Profile } from "../entity/Profile";
import { bodyValidator } from "./decorators/bodyValidator";
import { Photo } from "../entity/Photo";

@controller("/api/user")
export class UserController {
  @get("/")
  async getUsers(req: Request, res: Response) {
    const users = await User.find({ relations: ["profile", "photos"] });
    res.send(users);
  }

  @get("/:id")
  async getUserById(req: Request, res: Response) {
    const user = await User.findByIds([req.params.id], {
      relations: ["profile", "photo"]
    });
    res.send(user);
  }

  @post("/")
  @bodyValidator(["firstName", "profile", "photo"])
  async createUser(req: Request, res: Response) {
    const profile = await Profile.create(req.body.profile).save();
    const photo = await Photo.create(req.body.photo).save();

    const photos = [photo];

    const user = await User.create({
      firstName: req.body.firstName,
      profile,
      photos
    }).save();

    res.send(user);
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
