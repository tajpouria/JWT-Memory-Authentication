export enum Methods {
  get = "get",
  post = "post",
  put = "put",
  delete = "delete"
}

export enum MetaDataKeys {
  method = "method",
  path = "path",
  middleware = "middleWare",
  validator = "validator"
}

const rotesBinder = (method: Methods) => (path: string) => (
  target: any,
  key: string
) => {
  Reflect.defineMetadata(MetaDataKeys.method, method, target, key);
  Reflect.defineMetadata(MetaDataKeys.path, path, target, key);
};

export const get = rotesBinder(Methods.get);
export const post = rotesBinder(Methods.post);
export const put = rotesBinder(Methods.put);
export const _delete = rotesBinder(Methods.delete);
