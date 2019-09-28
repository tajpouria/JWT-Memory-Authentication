import { gql } from "apollo-server-express";

export const typeDefs = gql`
    type Query {
        users: [User]!

        hi: String!

        me: User
    }
    type User {
        id: ID
        email: String
        password: String
        refreshTokenVersion: Int
    }

    type Mutation {
        register(email: String!, password: String!): Boolean!

        login(email: String!, password: String!): Login

        revokeRefreshTokenForUser(userId: ID!): Boolean

        logout: Boolean
    }

    type Login {
        accessToken: String!
        user: User
    }
`;
