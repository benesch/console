import { act, renderHook, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { useQueryStringState } from "./useQueryString";

describe("useQueryStringState", () => {
  beforeEach(() => {
    history.pushState(undefined, "", "/");
  });

  it("should not set a query string key when the state is falsey", async () => {
    const {
      result: {
        current: [val, _setVal],
      },
    } = renderHook(() => useQueryStringState("key"), {
      wrapper: BrowserRouter,
    });
    expect(val).toBe(undefined);
    await waitFor(() => expect(location.search).toBe(""));
  });

  it("updates the state value with the current query string value", async () => {
    history.pushState(undefined, "", "/?key=startingValue");
    await waitFor(() => expect(location.search).toBe("?key=startingValue"));
    const { result } = renderHook(() => useQueryStringState("key"), {
      wrapper: BrowserRouter,
    });
    const [val] = result.current;
    expect(val).toBe("startingValue");
  });

  it("updates the query string when setValue is called", async () => {
    const { result } = renderHook(() => useQueryStringState("key"), {
      wrapper: BrowserRouter,
    });
    let [val, setVal] = result.current;
    act(() => setVal("value"));
    [val, setVal] = result.current;
    expect(val).toBe("value");
    await waitFor(() => expect(location.search).toBe("?key=value"));
  });

  it("removes the query string key when the value is falsey", async () => {
    const { result } = renderHook(() => useQueryStringState("key"), {
      wrapper: BrowserRouter,
    });
    let [val, setVal] = result.current;
    act(() => setVal(""));
    [val, setVal] = result.current;
    expect(val).toBe("");
    await waitFor(() => expect(location.search).toBe(""));
  });
});
