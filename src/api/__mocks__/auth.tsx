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

/** we mock the authentication modules that depends on features not available in our jest setup */
export const mockUseAuth = () => {
  jest.mock("uuid", () => ({ v4: jest.fn(() => "pseudo-random") }));
  jest.mock("@frontegg/react", () => {
    return {
      useAuth: jest.fn(() => dummyValidUser),
    };
  });
  jest.mock("../auth", () => {
    return {
      AuthProvider: jest.fn(({ children }) => <>{children}</>),
      RestfulProvider: jest.fn(({ children }) => <>{children}</>),
      useAuth: jest.fn(() => ({
        user: dummyValidUser,
      })),
    };
  });
};
