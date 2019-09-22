import { MetaDataKeys } from ".";

export const bodyValidator = (validators: string[]) => (
  target: any,
  key: string
) => {
  Reflect.defineMetadata(MetaDataKeys.validator, validators, target, key);
};
