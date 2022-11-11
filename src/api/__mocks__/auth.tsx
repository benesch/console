import type { User } from "@frontegg/redux-store";
import React from "react";

export const dummyValidUser: User = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  expiresIn: 1100000,
  expires: "",
  id: "1",
  email: "user@example.com",
  tenantIds: [],
  metadata: {},
  mfaEnrolled: true,
  name: "user",
  permissions: [],
  profilePictureUrl: "https://cdn.com/image",
  roles: [],
  tenantId: "tenant-id",
};

export const useAuth = jest.fn(() => ({
  user: dummyValidUser,
}));
export const AuthProvider = jest.fn(({ children }) => <>{children}</>);
export const RestfulProvider = jest.fn(({ children }) => <>{children}</>);
export const hasEnvironmentReadPermission = jest.fn(() => true);
