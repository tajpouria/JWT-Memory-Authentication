### Suspense with router

./src/App.tsx

```typescript
export const App = () => (
  <React.Suspense fallback={<div>loading...</div>}>
    <Router>
      <Home path="/" />
    </Router>
  </React.Suspense>
);
```

### useFetchSuspense custom hook

./src/hooks/useFetchSuspense.ts

```typescript
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
```

./pages/Home.tsx

```typescript
export const Home = () => (
  <React.Suspense fallback={<p>Loading...</p>}>
    <div>
      {useFetchSuspense("url").data.map(d => (
        <li key={d.id}>d.title</li>
      ))}
    </div>
  </React.Suspense>
);
```

### useWorker custom hook

```typescript
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
```
