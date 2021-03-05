import React from "react";
import { useUser } from "./AuthContext";
import { setContext } from "@apollo/client/link/context";
import {
  createHttpLink,
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
} from "@apollo/client";

type AuthApolloProviderProps = {
  uri: string;
  children: React.ReactNode;
};

function AuthApolloProvider({ uri, children }: AuthApolloProviderProps) {
  const { getSession } = useUser();
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

  return (
    <ApolloProvider
      client={
        new ApolloClient({
          link: authLink.concat(httpLink),
          cache: new InMemoryCache(),
        })
      }
    >
      {children}
    </ApolloProvider>
  );
}

export default AuthApolloProvider;
