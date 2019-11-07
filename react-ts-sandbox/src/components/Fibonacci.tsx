import * as React from "react";

import { useWorker } from "../hooks/useWorker";

interface Props {
  num: number;
}

function fib(n: number, memo: number[] = []): number {
  if (memo[n]) return memo[n];

  if (n <= 2) return 1;

  const res = fib(n - 1, memo) + fib(n - 2, memo);
  memo[n] = res;

  return res;
}

export const Fibonacci: React.FC<Props> = ({ num }) => {
  return (
    <div className="fibonacci">
      <p className="fibonacci__text">
        FIB({num})={useWorker(fib, [num])}
      </p>
    </div>
  );
};
