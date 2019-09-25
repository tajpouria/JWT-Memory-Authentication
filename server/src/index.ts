import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";

import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

(() => {
    const app = express();

    const apolloServer = new ApolloServer({ typeDefs, resolvers });
    apolloServer.applyMiddleware({ app });

    createConnection();

    app.listen(4000, () => console.info(`Listening on port 4000`));
})();
