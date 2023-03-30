import { act, renderHook } from "@testing-library/react";

import useDelayedLoading from "./useDelayedLoading";

describe("useDelayedLoading", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it("returns false until the timeout has elapsed", () => {
    const { result } = renderHook(() => useDelayedLoading(true, 100));
    expect(result.current).toBe(false);
    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe(true);
  });

  it("never returns true if loading is false before the timeout", () => {
    const { result, rerender } = renderHook(
      (loading) => useDelayedLoading(loading, 100),
      { initialProps: true }
    );
    expect(result.current).toBe(false);
    act(() => jest.advanceTimersByTime(99));
    expect(result.current).toBe(false);
    rerender(false);
    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe(false);
  });
});
