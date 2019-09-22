import { Request, Response, NextFunction } from "express";

import { AppRouter } from "../../routes/AppRouter";
import { MetaDataKeys, Methods } from ".";

const bodyValidator = (validators: string[]) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body) {
    res.status(422).send("Invalid request body.");
    return;
  }

  for (let validator of validators) {
    console.log(req.body);
    if (!req.body[validator]) {
      res.send(`Invalid request body ${validator}`);
      return;
    }
  }

  next();
};

export const controller = (prefix: string) => (constructor: Function) => {
  const router = AppRouter.instance;

  for (let key in constructor.prototype) {
    const routeHandler = constructor.prototype[key];

    const path = Reflect.getMetadata(
      MetaDataKeys.path,
      constructor.prototype,
      key
    );

    const method: Methods = Reflect.getMetadata(
      MetaDataKeys.method,
      constructor.prototype,
      key
    );

    const middleWares =
      Reflect.getMetadata(
        MetaDataKeys.middleware,
        constructor.prototype,
        key
      ) || [];

    const validators =
      Reflect.getMetadata(MetaDataKeys.validator, constructor.prototype, key) ||
      [];

    if (path) {
      router[method](
        `${prefix}${path}`,
        [...middleWares, bodyValidator(validators)],
        routeHandler
      );
    }
  }
};
