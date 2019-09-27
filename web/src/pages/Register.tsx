import * as React from "react";
import { RouteComponentProps } from "react-router";

import { useFrom } from "./hooks";
import { useRegisterMutation } from "../generated/graphql";

export const Register: React.FC<RouteComponentProps> = ({ history }) => {
    const { values, handleValueChange } = useFrom({ email: "", password: "" });
    const [register, { data }] = useRegisterMutation();

    const handleSubmit = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();

        await register({
            variables: { email: values.email, password: values.password }
        });

        data && data.register && history.push("/home");
    };
    return (
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
            <button onClick={handleSubmit}>Submit</button>
        </form>
    );
};
