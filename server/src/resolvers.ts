import { User } from "./entity/User";
import { hash, compare } from "bcryptjs";
import { MyContext } from "./myContext";
import { createAccessToken } from "./auth";
import { combineResolvers } from "graphql-resolvers";
import { isLoggedIn } from "./isLoggedIn";
import { setRefreshToken } from "./setRefreshToken";
import { getConnection } from "typeorm";

export const resolvers = {
    Query: {
        users: async () => await User.find(),

        hi: combineResolvers(
            isLoggedIn,
            (_parent: any, args: any, context: MyContext) =>
                `userId is ${context.payload!.userId}`
        )
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

            return createAccessToken(user);
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
        }
    }
};
