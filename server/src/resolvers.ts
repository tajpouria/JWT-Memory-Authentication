import { User } from "./entity/User";
import { hash, compare } from "bcryptjs";
import { MyContext } from "./myContext";
import { createAccessToken } from "./auth";
import { combineResolvers } from "graphql-resolvers";
import { isLoggedIn } from "./isLoggedIn";
import { setRefreshToken } from "./setRefreshToken";
import { getConnection } from "typeorm";
import { verify } from "jsonwebtoken";

export const resolvers = {
    Query: {
        users: async () => await User.find(),

        hi: combineResolvers(
            isLoggedIn,
            (_parent: any, args: any, context: MyContext) =>
                `userId is ${context.payload!.userId}`
        ),

        me: async (_parent: any, _args: any, { req }: MyContext) => {
            const authorization = req.headers.authorization;

            if (!authorization) {
                return null;
            }

            try {
                const token = authorization.split(" ")[1];

                const payload = verify(
                    token,
                    process.env.ACCESS_TOKEN_SECRET!
                ) as any;

                const user = await User.findOne({ id: payload.userId });

                if (!user) {
                    return null;
                }
                return user;
            } catch (err) {
                console.error("error in happened while parsing accessToken.");
                throw new Error(err);
            }
        }
    },
    Mutation: {
        register: async (_parent: any, args: any) => {
            try {
                const hashedPassword = await hash(args.password, 12);
                await User.insert({
                    email: args.email,
                    password: hashedPassword
                });
                return true;
            } catch (err) {
                console.error(err);
                return false;
            }
        },

        login: async (
            _parent: any,
            { email, password }: any,
            { res }: MyContext
        ) => {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw new Error("Invalid Email or Password");
            }

            const isValidEmailAndPass = await compare(password, user.password);

            if (!isValidEmailAndPass) {
                throw new Error("Invalid Email or Password");
            }

            setRefreshToken(res, user);

            return { accessToken: createAccessToken(user), user };
        },

        revokeRefreshTokenForUser: async (_parent: any, { userId }: any) => {
            try {
                await getConnection()
                    .getRepository(User)
                    .increment({ id: userId }, "refreshTokenVersion", 1);

                return true;
            } catch (err) {
                throw new Error(err);
            }
        },

        logout: async (_parent: any, _args: any, { res }: MyContext) => {
            try {
                res.clearCookie("jid");
                return true;
            } catch (err) {
                console.error(
                    "error happened while trying to clear the cookie."
                );
                throw new Error(err);
            }
        }
    }
};
