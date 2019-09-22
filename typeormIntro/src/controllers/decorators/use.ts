import { RequestHandler } from "express";
import { MetaDataKeys } from ".";

export const use = (middleWare: RequestHandler) => (
  target: any,
  key: string
) => {
  const assignedMiddleWares =
    Reflect.getMetadata(MetaDataKeys.middleware, target, key) || [];

  Reflect.defineMetadata(
    MetaDataKeys.middleware,
    [...assignedMiddleWares, middleWare],
    target,
    key
  );
};
``