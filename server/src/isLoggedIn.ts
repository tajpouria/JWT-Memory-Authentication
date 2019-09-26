import { MyContext } from "./myContext";
import { skip } from "graphql-resolvers";
import { verify } from "jsonwebtoken";

export const isLoggedIn = (_parent: any, args: any, context: MyContext) => {
    try {
        const authorization = context.req.headers.authorization;
        if (authorization) {
            const token = authorization.split(" ")[1];

            const payload = verify(
                token,
                process.env.ACCESS_TOKEN_SECRET!
            ) as any;

            context.payload = { userId: payload.userId };

            skip;
        }
    } catch (err) {
        console.error(err);
        throw new Error("Not Authorized");
    }
};
