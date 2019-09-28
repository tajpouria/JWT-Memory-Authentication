import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import { Home, Login, Register, Hi } from "./pages";
import { Header } from "./Header";

export const Routes: React.FC = () => {
    return (
        <BrowserRouter>
            <Header />
            <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/register" component={Register} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/hi" component={Hi} />
            </Switch>
        </BrowserRouter>
    );
};
