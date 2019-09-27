import React from "react";
import { Link, BrowserRouter, Switch, Route } from "react-router-dom";

import { Home, Login, Register } from "./pages";

export const Routes: React.FC = () => {
    return (
        <BrowserRouter>
            <header>
                <Link to="/">Home</Link>
                <Link to="/register">Register</Link>
                <Link to="/login">Login</Link>
            </header>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/register" component={Register} />
                <Route exact path="/login" component={Login} />
            </Switch>
        </BrowserRouter>
    );
};
