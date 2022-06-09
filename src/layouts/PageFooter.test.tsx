import { render, screen } from "@testing-library/react";
import React from "react";

import PageFooter, { getCurrentYear } from "./PageFooter";

beforeAll(() => {
  jest.setSystemTime(new Date(2022, 3, 1));
});

jest.mock("../api/auth.tsx", () => ({
  useAuth: jest.fn(() => ({ user: { email: "user@materialize.com" } })),
}));

describe("components/footer", () => {
  describe("getCurrentYear", () => {
    it("should return a four digit representation of the current year", () => {
      expect(getCurrentYear()).toBe(2022);
    });
  });

  describe("PageFooter", () => {
    it("should display the current year", () => {
      render(<PageFooter />);
      expect(screen.getByText("© 2022 Materialize, Inc.")).toBeDefined();
    });
    it("should display a link to the jira status page", () => {
      render(<PageFooter />);
      const link = screen.getByText("System Status") as HTMLAnchorElement;
      expect(link).toBeDefined();
      expect(link.href).toBe("https://status.materialize.com/");
    });
  });
});
