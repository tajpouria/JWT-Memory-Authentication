import * as React from "react";
import { setAccessToken } from "./accessToken";
import { Routes } from "./Routes";

export const App: React.FC = () => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch("http://localhost:4000/refresh_token", {
            method: "POST",
            credentials: "include"
        }).then(async res => {
            const { accessToken } = await res.json();
            setAccessToken(accessToken);
            setLoading(false);
        });
    }, []);

    return <>{loading ? <div>Loading ...</div> : <Routes />}</>;
};
