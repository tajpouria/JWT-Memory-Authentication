import React from "react";
import { Router } from "@reach/router";

import { Indicator } from "./components/Indicator";
import Nav from "./components/nav";
const Home = React.lazy(() => import("./pages/home"));
const Calculations = React.lazy(() => import("./pages/calculations"));

const App: React.FC = () => {
  return (
    <div className="App">
      <Nav />

      <React.Suspense fallback={<Indicator />}>
        <Router>
          <Home path="/" />
          <Calculations path="/calculations" />
        </Router>
      </React.Suspense>
    </div>
  );
};

export default App;
