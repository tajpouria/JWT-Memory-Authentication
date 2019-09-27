import * as React from "react";
import { useUsersQuery } from "../generated/graphql";

export const Home: React.FC = () => {
    const { data, loading } = useUsersQuery({ fetchPolicy: "network-only" });

    return (
        <div>
            {loading || !data ? (
                <div>Loading</div>
            ) : (
                <ul>
                    {data.users.map(
                        x =>
                            x && (
                                <li
                                    key={x.id!}
                                >{`id: ${x.id} email: ${x.email}`}</li>
                            )
                    )}
                </ul>
            )}
        </div>
    );
};
