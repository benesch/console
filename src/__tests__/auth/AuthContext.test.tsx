import React from "react";
import { UserProvider, useUser } from "../../auth/AuthContext";
import { renderHook } from "@testing-library/react-hooks";

jest.mock("aws-amplify");

describe("useUser()", () => {
  test("errors when not in a UserProvider", () => {
    try {
      const { result } = renderHook(() => useUser());
      // For some reason, this stringify makes the render
      // actually happen to throw
      JSON.stringify(result);
      fail("Should have thrown");
    } catch (e) {
      expect(e.message).toContain("UserProvider");
    }
  });

  describe("when in a UserProvider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider
        region="us-east-2"
        userPoolId="us-east-2_GbM7D8ZVg"
        userPoolWebClientId="7st072o8h1lhfj66mjf9vbcauo"
      >
        {children}
      </UserProvider>
    );

    it("renders successfully in the page", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useUser(), {
        wrapper,
      });
      await waitForNextUpdate();
      expect(result.error).toBeUndefined();
    });

    it("sets user when login succeeds", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useUser(), {
        wrapper,
      });

      result.current.login("user", "correct");
      await waitForNextUpdate();

      expect(result.current.user).not.toBeNull();
    });

    it("removes user when logged out", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useUser(), {
        wrapper,
      });

      result.current.login("user", "correct");
      await waitForNextUpdate();
      result.current.logout();
      await waitForNextUpdate();

      expect(result.current.user).toBeNull();
    });
  });
});
