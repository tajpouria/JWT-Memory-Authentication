import LRU from "lru-cache";
import md5 from "md5";
import workerpool from "workerpool";

enum Status {
  pending = "pending",
  resolved = "resolved"
}

const cache = new LRU(50);

const pool = workerpool.pool();

export const useWorker = (worker: Function, args: any[] = []) => {
  const key = `${worker.name}.${md5(JSON.stringify(args))}`;

  const value: any = cache.get(key) || {
    status: Status.pending,
    data: undefined
  };

  if (value.status === Status.resolved) {
    return value.data;
  }

  const promise = pool.exec(worker as any, args);

  promise.then(data => {
    cache.set(key, { status: Status.resolved, data });
  });

  throw promise;
};
