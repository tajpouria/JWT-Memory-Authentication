import * as React from "react";
import { Link } from "react-router-dom";
import { useMeQuery, useLogoutMutation } from "./generated/graphql";
import { setAccessToken } from "./accessToken";

export const Header: React.FC = () => {
    const { data, loading } = useMeQuery();
    const [logout, { client }] = useLogoutMutation();

    const handleLogout = async () => {
        await logout();
        setAccessToken("");
        await client!.resetStore();
    };

    let body: JSX.Element | null;

    if (loading) {
        body = null;
    } else if (data && data.me) {
        body = <div>You logged in as: {data.me.email}</div>;
    } else {
        body = <div>not logged in...</div>;
    }

    return (
        <div>
            <header>
                <div>
                    <Link to="/">Home</Link>
                </div>
                <div>
                    <Link to="/register">Register</Link>
                </div>
                <div>
                    <Link to="/login">Login</Link>
                </div>
                <div>
                    <Link to="/hi">hi</Link>
                </div>
                <div>{body}</div>
                {!loading && data && data.me && (
                    <button onClick={handleLogout}>Logout</button>
                )}
            </header>
        </div>
    );
};
