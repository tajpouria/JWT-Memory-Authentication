import "reflect-metadata";
import "dotenv/config";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";

import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { MyContext } from "./myContext";

(() => {
    const app = express();

    const apolloServer = new ApolloServer({
        context: ({ req, res }): MyContext => ({ req, res }),
        typeDefs,
        resolvers
    });
    apolloServer.applyMiddleware({ app });

    createConnection();

    app.listen(4000, () => console.info(`Listening on port 4000`));
})();
