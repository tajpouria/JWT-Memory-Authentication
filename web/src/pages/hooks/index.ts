import { useState } from "react";

export const useFrom = (initialState: { [key: string]: any }) => {
    const [values, setValues] = useState(initialState);

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const value = e.target.value;

        setValues(st => ({
            ...st,
            [name]: value
        }));
    };

    return { values, handleValueChange };
};
