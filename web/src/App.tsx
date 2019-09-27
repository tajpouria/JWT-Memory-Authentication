import React from "react";
import "./App.css";
import gql from "graphql-tag";
import { useUsersQuery } from "./generated/graphql";

const App: React.FC = () => {
    const { data, loading } = useUsersQuery();
    return (
        <div className="App">
            {loading || !data ? (
                <em>Loading...</em>
            ) : (
                <div>{JSON.stringify(data, null, 2)}</div>
            )}
        </div>
    );
};

export default App;
