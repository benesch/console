import React from "react";
import { useUser } from "./AuthContext";
import { setContext } from "@apollo/client/link/context";
import {
  createHttpLink,
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

type AuthApolloProviderProps = {
  uri: string;
  children: React.ReactNode;
};

export function AuthApolloProvider({ uri, children }: AuthApolloProviderProps) {
  const { getSession, setAuthTokenRejected } = useUser();
  const httpLink = createHttpLink({
    uri,
  });

  const authLink = setContext(async (_, { headers }) => {
    try {
      const session = await getSession();
      if (session.isValid()) {
        const accessToken = session.getIdToken().getJwtToken();

        return {
          headers: {
            ...headers,
            authorization: `Bearer ${accessToken}`,
          },
        };
      }
    } catch {
      // If there's no logged in user, we don't send an auth header.
    }
  });

  const errorLink = onError(({ graphQLErrors }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, extensions }) => {
        if (
          extensions &&
          "code" in extensions &&
          extensions.code == "AUTH-INVALID"
        ) {
          console.error(`Server rejected authentication token: ${message}`);
          setAuthTokenRejected(extensions.reasonCode);
        }
      });
  });

  return (
    <ApolloProvider
      client={
        new ApolloClient({
          link: errorLink.concat(authLink).concat(httpLink),
          cache: new InMemoryCache(),
        })
      }
    >
      {children}
    </ApolloProvider>
  );
}
