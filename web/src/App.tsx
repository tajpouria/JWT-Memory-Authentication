import React from "react";
import "./App.css";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

const GET_USERS = gql`
    query users {
        users {
            id
            email
            refreshTokenVersion
        }
    }
`;

const App: React.FC = () => {
    const { data, loading } = useQuery(GET_USERS);
    return (
        <div className="App">
            {loading ? (
                <em>Loading...</em>
            ) : (
                <div>{JSON.stringify(data, null, 2)}</div>
            )}
        </div>
    );
};

export default App;
