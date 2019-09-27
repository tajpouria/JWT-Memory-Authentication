import * as React from "react";

import { useFrom } from "./hooks";
import { useLoginMutation } from "../generated/graphql";
import { setAccessToken } from "../accessToken";

export const Login = () => {
    const { values, handleValueChange } = useFrom({ email: "", password: "" });

    const [login, { data, loading }] = useLoginMutation();

    const handleSubmit = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();

        login({
            variables: { email: values.email, password: values.password }
        }).then(res => {
            res.data && res.data.login && setAccessToken(res.data.login);
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
