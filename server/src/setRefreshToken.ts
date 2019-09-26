import { Response } from "express";
import { User } from "./entity/User";
import { createRefreshToken } from "./auth";

export const setRefreshToken = (res: Response, user: User) =>
    res.cookie("jit", createRefreshToken(user), { httpOnly: true });
