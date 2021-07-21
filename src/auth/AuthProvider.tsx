/** Authentication management. */

import React, { useEffect } from "react";
import { Auth as Cognito, CognitoUser } from "@aws-amplify/auth";
import { setContext } from "@apollo/client/link/context";
import {
  createHttpLink,
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

/**
 * Re-export the underlying AWS "Auth" module as "Cognito"
 * for clarity. This module is the module that owns the term "Auth".
 */
export { Cognito };

/** Represents a user that has authenticated with AWS Cognito. */
interface IUser extends CognitoUser {
  // For some reason these fields are missing from the upstream type definition,
  // but they are definitely present on the concrete object.
  attributes: { email: string };
  challengeName: string;
}

/** The name of each authentication state. */
export enum AuthStatus {
  Loading,
  LoggedIn,
  LoggedOut,
}

/** The possible states of the authentication system. */
export type AuthState =
  | { status: AuthStatus.Loading }
  | { status: AuthStatus.LoggedIn; user: IUser }
  | { status: AuthStatus.LoggedOut; reason: string | null };

export interface IAuthContext {
  /** The current authentication state. */
  state: AuthState;
  /** Log in with the specified credentials. */
  login: (username: string, password: string) => Promise<IUser>;
  /** Log out the current user. */
  logout: () => Promise<void>;
}

/**
 * A React provider that manages authentication. Any child of this provider will
 * have access to the current user, if one is logged in, plus the ability to log
 * users in and out.
 */
export const AuthProvider = (props: { children: React.ReactNode }) => {
  const [state, setState] = React.useState<AuthState>({
    status: AuthStatus.Loading,
  });

  // This effect retrievews the current user on startup.
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const user = await Cognito.currentAuthenticatedUser();
        setState({ status: AuthStatus.LoggedIn, user });
      } catch (e) {
        setState({ status: AuthStatus.LoggedOut, reason: null });
      }
    }
    loadCurrentUser();
  }, []);

  const login = async (username: string, password: string) => {
    const user = await Cognito.signIn(username, password);
    setState({ status: AuthStatus.LoggedIn, user });
    return user;
  };

  const logout = async () => {
    await Cognito.signOut();
    setState({ status: AuthStatus.LoggedOut, reason: null });
  };

  const httpLink = createHttpLink({
    uri: "/api/graphql",
  });

  const authLink = setContext(async (_, { headers }) => {
    try {
      const session = await Cognito.currentSession();
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
      // If there's no logged in user, don't send an auth header.
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
          setState({
            status: AuthStatus.LoggedOut,
            reason: extensions.reasonCode,
          });
        }
      });
  });

  const client = new ApolloClient({
    link: errorLink.concat(authLink).concat(httpLink),
    cache: new InMemoryCache(),
  });

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      <ApolloProvider client={client}>{props.children}</ApolloProvider>
    </AuthContext.Provider>
  );
};

const AuthContext = React.createContext<IAuthContext>(undefined!);

/**
 * Accesses authentication state within a React component.
 *
 * This function must be called from a component that is a child of the
 * `AuthProvider`.
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error(
      "`useAuth` hook must be used within an `AuthProvider` component"
    );
  }
  return context;
};
