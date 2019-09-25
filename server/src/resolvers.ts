import { User } from "./entity/User";
import { hash } from "bcryptjs";

export const resolvers = {
    Query: {
        users: async () => await User.find()
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
        }
    }
};
