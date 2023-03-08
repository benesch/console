/**
 * @module
 * API authentication support.
 */

import { useAuth as useFronteggAuth } from "@frontegg/react";
import { AuthState, User } from "@frontegg/redux-store";
import type { ITenantsResponse } from "@frontegg/rest-api";
import React from "react";

export type FetchAuthedType = (
  input: RequestInfo,
  init?: RequestInit
) => Promise<Response>;

/**
 * The authentication state.
 *
 * This is largely managed with Frontegg, but contains a few Materialize Cloud-
 * specific additions.
 */
export interface IAuthContext extends AuthState {
  /** The authenticated user. */
  user: User;
  /**
   * Make an authenticated HTTP request.
   *
   * The API of `fetchAuthed` is identical to `window.fetch`, except that the
   * credentials of the current user, if any, will be attached to the request.
   */
  fetchAuthed: FetchAuthedType;
}

export interface AuthProviderProps {
  user: User;
  children: React.ReactNode;
}

/**
 * A React provider that manages authentication state.
 */
export const AuthProvider = ({ user, children }: AuthProviderProps) => {
  const authState = useFronteggAuth((state) => state);
  const fetchAuthed = async (input: RequestInfo, init?: RequestInit) =>
    fetch(input, {
      ...init,
      headers: {
        authorization: `Bearer ${user.accessToken}`,
        ...init?.headers,
      },
    });

  return (
    <AuthContext.Provider value={{ ...authState, user, fetchAuthed }}>
      {children}
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
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error(
      "`useAuth` hook must be used within an `AuthProvider` component"
    );
  }
  return context;
}

export function hasEnvironmentReadPermission(user: User): boolean {
  return !!user.permissions.find(
    (p) => p.key === "materialize.environment.read"
  );
}

export function hasEnvironmentWritePermission(user: User): boolean {
  return !!user.permissions.find(
    (p) => p.key === "materialize.environment.write"
  );
}

export function getCurrentTenant(
  user: User,
  tenants: ITenantsResponse[]
): ITenantsResponse | undefined {
  const tenant = tenants.find((t) => t.tenantId === user.tenantId);
  // Frontegg reports that it's loaded before this data is available, so for now we have
  // to handle undefined tenants down stream
  // if (!tenant) {
  //   throw new Error(`Unknown tenant: ${user.tenantId}`);
  // }
  return tenant;
}

type MzTenantMetadata = {
  blocked: boolean;
};

export function getTenantMetadata(tenant: ITenantsResponse): MzTenantMetadata {
  let parsedMetadata: any = {};
  try {
    parsedMetadata = JSON.parse(tenant.metadata);
  } catch (e) {
    // No-op
    console.warn("Invalid tenant metadata value");
  }

  // TODO this complexity is temporary until the organization configuration
  // service is deployed. That will ensure we get normalized metadata (at
  // the cost of an additional network request).
  let blocked = false;
  if (typeof parsedMetadata["blocked"] === "boolean") {
    blocked = parsedMetadata["blocked"];
  } else {
    console.warn(
      "Inferring blocked status. Found:",
      JSON.stringify(parsedMetadata["blocked"])
    );
  }
  return {
    blocked,
  };
}
