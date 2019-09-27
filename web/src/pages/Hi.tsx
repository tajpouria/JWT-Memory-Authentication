import * as React from "react";
import { useHiQuery } from "../generated/graphql";

export const Hi: React.FC = () => {
    const { data, loading, error } = useHiQuery();

    if (error) {
        console.error(error);
        return <div>error ...</div>;
    }

    if (!data) {
        return <div>no data...</div>;
    }

    return (
        <>
            {loading ? (
                <div>loading...</div>
            ) : (
                <div>{JSON.stringify(data, null, 2)}</div>
            )}
        </>
    );
};
