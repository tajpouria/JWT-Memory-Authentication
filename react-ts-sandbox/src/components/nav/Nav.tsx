import * as React from "react";

import { Link } from "@reach/router";

export const Nav: React.FC = () => {
  return (
    <div className="nav">
      <span className="nav__title">Navigation Bar</span>
      <ul className="nav__itemsContainer">
        <li className="nav__item">
          <Link to="/" className="nav__itemLink">
            Home
          </Link>
        </li>
        <span className="nav__splitterPipe">|</span>
        <li className="nav__item">
          <Link to="/calculations" className="nav__itemLink">
            Calculation
          </Link>
        </li>
      </ul>
    </div>
  );
};
