/** Authenticated feth supports. */

import React from "react";
import { RestfulProvider } from "restful-react";
import { useAuth } from "@frontegg/react";

export interface IAuthedFetchContext {
  /**
   * Make an authenticated HTTP request.
   *
   * The API of `fetchAuthed` is identical to `window.fetch`, except that the
   * credentials of the current user, if any, will be attached to the request.
   */
  fetchAuthed(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

/**
 * A React provider that manages authenticated fetch requests.
 */
export const AuthedFetchProvider = (props: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const requestOptions = async () => {
    return { headers: { authorization: `Bearer ${user.accessToken}` } };
  };

  const fetchAuthed = async (input: RequestInfo, init?: RequestInit) =>
    fetch(input, {
      ...(await requestOptions()),
      ...init,
    });

  return (
    <AuthedFetchContext.Provider value={{ fetchAuthed }}>
      <RestfulProvider base="/" requestOptions={requestOptions}>
        {props.children}
      </RestfulProvider>
    </AuthedFetchContext.Provider>
  );
};

const AuthedFetchContext = React.createContext<IAuthedFetchContext>(undefined!);

/**
 * Accesses authentication state within a React component.
 *
 * This function must be called from a component that is a child of the
 * `AuthedFetchProvider`.
 */
export const useAuthedFetch = () => {
  const context = React.useContext(AuthedFetchContext);
  if (!context) {
    throw new Error(
      "`useAuthedFetch` hook must be used within an `AuthedFetchProvider` component"
    );
  }
  return context;
};
