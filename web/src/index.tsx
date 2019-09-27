import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink, Observable } from "apollo-link";
import { TokenRefreshLink } from "apollo-link-token-refresh";

import { getAccessToken, setAccessToken } from "./accessToken";
import { App } from "./App";
import JwtDecode from "jwt-decode";

const cache = new InMemoryCache();

const requestLink = new ApolloLink(
    (operation, forward) =>
        new Observable(observer => {
            let handle: any;
            Promise.resolve(operation)
                .then(operation => {
                    const accessToken = getAccessToken();
                    if (accessToken) {
                        operation.setContext({
                            headers: { Authorization: `bearer ${accessToken}` }
                        });
                    }
                })
                .then(() => {
                    handle = forward(operation).subscribe({
                        next: observer.next.bind(observer),
                        error: observer.error.bind(observer),
                        complete: observer.complete.bind(observer)
                    });
                })
                .catch(observer.error.bind(observer));

            return () => {
                if (handle) handle.unsubscribe();
            };
        })
);

const client = new ApolloClient({
    link: ApolloLink.from([
        new TokenRefreshLink({
            accessTokenField: "accessToken", // the actual name of access token field the come from response if return false means invalid it's go ahead and fetch for accessToken
            isTokenValidOrUndefined: () => {
                const token = getAccessToken();

                if (!token) {
                    return true;
                }

                try {
                    const { exp } = JwtDecode(token);

                    if (Date.now() >= exp * 1000) {
                        return false;
                    } else {
                        return true;
                    }
                } catch {
                    return false;
                }
            },
            fetchAccessToken: () => {
                // how to fetch access refresh token
                return fetch("http://localhost:4000/refresh_token", {
                    method: "POST",
                    credentials: "include"
                });
            },
            handleFetch: accessToken => {
                // what to do with fetched access token
                setAccessToken(accessToken);
            },
            handleError: err => {
                console.warn("Your refresh token is invalid. Try to relogin");
                console.error(err);
            }
        }),
        onError(({ graphQLErrors, networkError }) => {
            if (graphQLErrors) {
                console.error(graphQLErrors);
            }
            if (networkError) {
                console.error(networkError);
            }
        }),
        requestLink,
        new HttpLink({
            uri: "http://localhost:4000/graphql",
            credentials: "include"
        })
    ]),
    cache
});

ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>,
    document.getElementById("root")
);
