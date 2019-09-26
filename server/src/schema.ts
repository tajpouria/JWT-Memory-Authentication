import { gql } from "apollo-server-express";

export const typeDefs = gql`
    type Query {
        users: [User]!

        hi: String!
    }
    type User {
        id: ID
        email: String
        password: String
        refreshTokenVersion: Int
    }

    type Mutation {
        register(email: String!, password: String!): Boolean

        login(email: String!, password: String!): String

        revokeRefreshTokenForUser(userId: ID!): Boolean
    }
`;
