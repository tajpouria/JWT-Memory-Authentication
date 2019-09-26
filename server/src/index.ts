import "reflect-metadata";
import "dotenv/config";
import { createConnection } from "typeorm";
import express, { Request, Response } from "express";
import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";

import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { MyContext } from "./myContext";
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";
import { createAccessToken } from "./auth";
import { setRefreshToken } from "./setRefreshToken";

(() => {
    const app = express();

    app.use(cookieParser());

    app.post("/refresh_token", async (req: Request, res: Response) => {
        const refreshToken = req.cookies.jid;

        if (!refreshToken) {
            res.status(422).send({ ok: false, accessToken: "" });
            throw new Error("bad credential");
        }

        let payload: any = undefined;

        try {
            payload = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
        } catch (err) {
            res.status(422).send({ ok: false, accessToken: "" });
            throw new Error("Verifying refresh token failed!");
        }

        const user = payload
            ? await User.findOne({ id: payload.userId })
            : undefined;

        if (!user) {
            res.status(422).send({ ok: false, accessToken: "" });
            throw new Error("User not found");
        }

        if (payload.refreshTokenVersion !== user.refreshTokenVersion) {
            res.status(422).send({ ok: false, accessToken: "" });
            throw new Error("Invalid refreshToken version");
        }

        setRefreshToken(res, user);

        res.send({ ok: true, accessToken: createAccessToken(user) });
    });

    const apolloServer = new ApolloServer({
        context: ({ req, res }): MyContext => ({ req, res }),
        typeDefs,
        resolvers
    });
    apolloServer.applyMiddleware({ app });

    createConnection();

    app.listen(4000, () => console.info(`Listening on port 4000`));
})();
