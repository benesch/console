import { fireEvent, render } from "@testing-library/react";
import React from "react";

import { CopyableText } from "./Copyable";

const monkeyPatchClipboard = () => {
  if (navigator.clipboard === undefined) {
    // @ts-expect-error
    navigator.clipboard = {
      writeText: jest.fn(),
    };
  }
};

describe("Copyable", () => {
  jest.useFakeTimers();
  monkeyPatchClipboard();
  afterEach(jest.resetAllMocks);
  it("should copy the inner text in the clipboard on click", () => {
    const { getByTestId } = render(
      <CopyableText data-testid="copyable">Hello World</CopyableText>
    );

    fireEvent.click(getByTestId("copyable"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Hello World");
  });

  it("should showed a visual indicator for a second after the text has been successfully copied", async () => {
    const { getByTestId, findByTestId } = render(
      <CopyableText data-testid="copyable">Hello World</CopyableText>
    );

    expect(getByTestId("copyable-copyicon")).toBeDefined();
    fireEvent.click(getByTestId("copyable"));

    await findByTestId("copyable-checkicon");

    jest.advanceTimersByTime(1100);
    expect(findByTestId("copyable-copyicon")).toBeDefined();
  });
});
