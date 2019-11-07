import LRU from "lru-cache";
import md5 from "md5";

enum Status {
  pending = "pending",
  resolved = "resolved"
}

const cache = new LRU(50);

export const useFetchSuspense = (
  url: string,
  suspenseFetchOptions: RequestInit = {}
) => {
  const key = `${url}.${md5(JSON.stringify(suspenseFetchOptions))}`;

  const value: any = cache.get(key) || {
    status: Status.pending,
    data: undefined
  };

  if (value.status === Status.resolved) {
    return value.data;
  }

  const promise = fetch(url, suspenseFetchOptions).then(res => res.json());

  promise.then(data => {
    cache.set(key, { status: Status.resolved, data });
  });

  throw promise;
};
