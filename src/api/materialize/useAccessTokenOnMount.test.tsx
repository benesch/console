import { renderHook } from "@testing-library/react-hooks";

import { useAuth } from "~/api/auth";

import useAccessTokenOnMount from "./useAccessTokenOnMount";

jest.mock("~/api/auth");

describe("useAccessTokenOnMount", () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { accessToken: "dummyAccessToken" },
    });
  });

  afterEach(() => {
    (useAuth as jest.Mock).mockReset();
  });

  it("should set the initial accessTokenOnMount value to the user.accessToken", () => {
    const { result } = renderHook(() => useAccessTokenOnMount());

    expect(result.current.accessTokenOnMount).toBe("dummyAccessToken");
  });

  it("should not change the accessTokenOnMount value if it is already set", () => {
    const { result, rerender } = renderHook(() => useAccessTokenOnMount());

    rerender();

    expect(result.current.accessTokenOnMount).toBe("dummyAccessToken");
  });

  it("should not update the accessTokenOnMount value if the accessToken changes", () => {
    const { result, rerender } = renderHook(() => useAccessTokenOnMount());

    expect(result.current.accessTokenOnMount).toBe("dummyAccessToken");

    (useAuth as jest.Mock).mockReturnValue({
      user: { accessToken: "updatedAccessToken" },
    });

    rerender();

    expect(result.current.accessTokenOnMount).toBe("dummyAccessToken");
  });
});
