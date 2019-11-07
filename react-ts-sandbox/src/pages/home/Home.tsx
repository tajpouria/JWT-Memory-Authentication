import * as React from "react";
import { RouteComponentProps } from "@reach/router";

import BostonRoutes from "../bostonRoutes";
import { Indicator } from "../../components/Indicator";

export const Home: React.FC<RouteComponentProps> = () => {
  return (
    <div className="home">
      <header className="home__header">
        <h3 className="home__headerTitle">Home</h3>
      </header>
      <section className="home__bostonRoutesContainer">
        <React.Suspense fallback={Indicator}>
          <BostonRoutes />
        </React.Suspense>
      </section>
    </div>
  );
};
