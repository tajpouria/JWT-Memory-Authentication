import { Response } from "express";
import { User } from "./entity/User";
import { createRefreshToken } from "./auth";

export const setRefreshToken = (res: Response, user: User) =>
    res.cookie("jid", createRefreshToken(user), {
        httpOnly: true,
        path: "/refresh_token"
    });
