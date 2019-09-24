import { Response, Request } from "express";

import { get, post, controller } from "./decorators";
import { Question } from "../entity/Question";
import { Category } from "../entity/Category";

@controller("/api/cq")
export class QuestionCategoryController {
  @get("/")
  async getCQ(req: Request, res: Response) {
    const question = await Question.find();
    const categories = await Category.find();
    res.json({
      question,
      categories
    });
  }
}
