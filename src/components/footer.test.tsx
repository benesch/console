import { render, screen } from "@testing-library/react";
import React from "react";

import { getCurrentYear, PageFooter } from "./footer";

beforeAll(() => {
  jest.useFakeTimers("modern");
  jest.setSystemTime(new Date(2020, 3, 1));
});

describe("components/footer", () => {
  describe("getCurrentYear", () => {
    it("should return a four digit representation of the current year", () => {
      expect(getCurrentYear()).toBe(2020);
    });
  });

  describe("PageFooter", () => {
    it("should display the current year", () => {
      render(<PageFooter />);
      expect(screen.getByText("© 2020 Materialize, Inc.")).toBeDefined();
    });
    it("should display a link to the jira status page", () => {
      render(<PageFooter />);
      const link = screen.getByText("System Status") as HTMLAnchorElement;
      expect(link).toBeDefined();
      expect(link.href).toBe("https://status.materialize.com/");
    });
  });
});
