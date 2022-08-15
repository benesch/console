/**
 * @module
 * API authentication support.
 */

import { useAuth as useFronteggAuth } from "@frontegg/react";
import { AuthState, User } from "@frontegg/redux-store";
import type { ITenantsResponse } from "@frontegg/rest-api";
import React from "react";
import {
  RestfulProvider as BaseRestfulProvider,
  RestfulReactProviderProps as BaseRestfulProviderProps,
} from "restful-react";

import { versionHeaders } from "../version/api";
import { Organization } from "./backend";

/**
 * The authentication state.
 *
 * This is largely managed with Frontegg, but contains a few Materialize Cloud-
 * specific additions.
 */
export interface IAuthContext extends AuthState {
  /** The authenticated user. */
  user: User;
  /** The authenticated organization. */
  organization: Organization;
  /** Whether the user has access to the Materialize Platform experience. */
  platformEnabled: boolean;
  /**
   * Make an authenticated HTTP request.
   *
   * The API of `fetchAuthed` is identical to `window.fetch`, except that the
   * credentials of the current user, if any, will be attached to the request.
   */
  fetchAuthed(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

export interface AuthProviderProps {
  user: User;
  organization: Organization;
  children: React.ReactNode;
}

/**
 * A React provider that manages authentication state.
 */
export const AuthProvider = ({
  user,
  organization,
  children,
}: AuthProviderProps) => {
  const authState = useFronteggAuth((state) => state);
  const fetchAuthed = async (input: RequestInfo, init?: RequestInit) =>
    fetch(input, {
      ...init,
      headers: {
        authorization: `Bearer ${user.accessToken}`,
        ...init?.headers,
      },
    });
  const platformEnabled =
    user.email.endsWith("@materialize.com") || organization.platformEnabled;

  return (
    <AuthContext.Provider
      value={{ ...authState, user, organization, platformEnabled, fetchAuthed }}
    >
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

interface RestfulProviderProps
  extends Omit<BaseRestfulProviderProps, "base" | "requestOptions"> {
  children: React.ReactNode;
}

/**
 * A wrapper for `BaseRestfulProvider` that wires up Frontegg authentication.
 */
export const RestfulProvider = (props: RestfulProviderProps) => {
  const { user } = useFronteggAuth((state) => state);

  const headers = versionHeaders();

  if (user) headers.authorization = `Bearer ${user.accessToken}`;

  return (
    <BaseRestfulProvider base="/" requestOptions={{ headers }} {...props} />
  );
};

export function hasEnvironmentReadPermission(user: User): boolean {
  const isMaterializeEmployee = user.email.endsWith("@materialize.com");
  return !!user.permissions.find(
    (permission) =>
      permission.key === "materialize.environment.read" ||
      // TODO: Once we assigned the correct user roles to materialize folks, delete this
      (isMaterializeEmployee && permission.key == "materialize.legacy.read")
  );
}

export function hasEnvironmentWritePermission(user: User): boolean {
  const isMaterializeEmployee = user.email.endsWith("@materialize.com");
  return !!user.permissions.find(
    (permission) =>
      permission.key === "materialize.environment.write" ||
      // TODO: Once we assigned the correct user roles to materialize folks, delete this
      (isMaterializeEmployee && permission.key == "materialize.legacy.write")
  );
}

export function getCurrentTenant(
  user: User,
  tenants: ITenantsResponse[]
): ITenantsResponse {
  const tenant = tenants.find((tenant) => tenant.tenantId === user.tenantId);
  if (!tenant) {
    throw new Error(`Unknown tenant: ${user.tenantId}`);
  }
  return tenant;
}
