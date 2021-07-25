/** Authentication management. */

import React, { useEffect } from "react";
import { Auth as Cognito, CognitoUser } from "@aws-amplify/auth";
import { RestfulProvider } from "restful-react";

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
  /**
   * Make an authenticated HTTP request.
   *
   * The API of `fetchAuthed` is identical to `window.fetch`, except that the
   * credentials of the current user, if any, will be attached to the request.
   */
  fetchAuthed(input: RequestInfo, init?: RequestInit): Promise<Response>;
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

  const requestOptions = async () => {
    const session = await Cognito.currentSession();
    const jwtToken = session.getIdToken().getJwtToken();
    return { headers: { authorization: `Bearer ${jwtToken}` } };
  };

  const onError = (error: { status?: number; data: any }) => {
    if (error.data && error.data.code == "AUTH-INVALID") {
      console.error(
        `Server rejected authentication token: ${error.data.detail}`
      );
      setState({
        status: AuthStatus.LoggedOut,
        reason: error.data.reasonCode,
      });
    }
  };

  const fetchAuthed = async (input: RequestInfo, init?: RequestInit) =>
    fetch(input, {
      ...(await requestOptions()),
      ...init,
    });

  return (
    <AuthContext.Provider value={{ state, login, logout, fetchAuthed }}>
      <RestfulProvider
        base="/"
        requestOptions={requestOptions}
        onError={onError}
      >
        {props.children}
      </RestfulProvider>
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
