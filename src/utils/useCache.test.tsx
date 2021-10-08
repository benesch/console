import { render, screen } from "@testing-library/react";
import React from "react";

import { useCache } from "./useCache";

/** a test component that displays the actual cache value */
// we cannot use `@testing-library/react-hooks` as we cannot rerender a hook with new inputs
const TestComponent: React.FC<{ value?: string }> = ({ value }) => {
  const cache = useCache(value);
  return <>{cache}</>;
};

describe("utils/useCache", () => {
  it("should save the initial input in the internal cache", () => {
    render(<TestComponent value="hello" />);
    expect(screen.getByText("hello")).toBeDefined();
  });

  it("should return the freshest version when new input is provided", () => {
    const { rerender } = render(<TestComponent value="hello" />);
    rerender(<TestComponent value="hella" />);
    expect(screen.getByText("hella")).toBeDefined();
  });

  it("should return the cached value if the new input is not defined ", () => {
    const { rerender } = render(<TestComponent value="hello" />);
    rerender(<TestComponent />);
    expect(screen.getByText("hello")).toBeDefined();
  });
});
