import * as React from "react";
import { RouteComponentProps } from "@reach/router";

import { Indicator } from "../../components/Indicator";
import { Fibonacci } from "../../components/Fibonacci";

export const Calculations: React.FC<RouteComponentProps> = () => {
  return (
    <div className="calculations">
      <h3 className="calculations_tile">Heavy CPU calculations</h3>
      <React.Suspense fallback={Indicator}>
        <Fibonacci num={100} />
      </React.Suspense>
    </div>
  );
};
