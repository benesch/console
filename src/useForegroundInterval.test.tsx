import { act, renderHook } from "@testing-library/react";

import { useIsPollingDisabled } from "./recoil/focus";
import useForegroundInterval, { usePoll } from "./useForegroundInterval";

jest.mock("~/recoil/focus");

const mockedUseIsPollingDisabled = jest.mocked(useIsPollingDisabled);
const mockCallback = jest.fn();

const renderComponent = () => {
  return renderHook(() => useForegroundInterval(mockCallback));
};

describe("useForegroundInterval", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, "setInterval");
    mockCallback.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should start polling when the document has focus", () => {
    mockedUseIsPollingDisabled.mockReturnValue(false);
    renderComponent();

    expect(setInterval).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(5000);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should stop polling on blur and resume polling on focus", () => {
    mockedUseIsPollingDisabled.mockReturnValue(true);
    const { rerender } = renderComponent();

    expect(setInterval).not.toHaveBeenCalled();
    jest.advanceTimersByTime(5000);
    expect(mockCallback).not.toHaveBeenCalled();

    mockedUseIsPollingDisabled.mockReturnValue(false);
    rerender();

    expect(setInterval).toHaveBeenCalledTimes(1);
    // Execute the callback immediately when focus is regained
    expect(mockCallback).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(5000);
    // Resume polling
    expect(mockCallback).toHaveBeenCalledTimes(2);
  });
});

describe("usePoll", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, "setInterval");
    mockCallback.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should not poll when loading", () => {
    mockedUseIsPollingDisabled.mockReturnValue(false);
    renderHook(() => usePoll(true, mockCallback));

    jest.advanceTimersByTime(5000);
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("should poll when not loading", async () => {
    mockedUseIsPollingDisabled.mockReturnValue(false);
    renderHook(() => usePoll(false, mockCallback));

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockCallback).toHaveBeenCalled();
  });
});
