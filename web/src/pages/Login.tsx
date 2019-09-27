import * as React from "react";

import { useFrom } from "./hooks";
import { useLoginMutation } from "../generated/graphql";

export const Login = () => {
    const { values, handleValueChange } = useFrom({ email: "", password: "" });

    const [login, { data, loading }] = useLoginMutation();

    const handleSubmit = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();

        await login({
            variables: { email: values.email, password: values.password }
        });
    };
    return (
        <>
            <form>
                <div>
                    <input
                        name="email"
                        value={values.email}
                        onChange={handleValueChange}
                    />
                </div>
                <div>
                    <input
                        name="password"
                        type="password"
                        value={values.password}
                        onChange={handleValueChange}
                    />
                </div>
                <button onClick={handleSubmit}>Login</button>
            </form>
            <div>{!loading && data && JSON.stringify(data, null, 2)}</div>
        </>
    );
};
