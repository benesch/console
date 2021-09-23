import { render, screen } from "@testing-library/react";
import React from "react";

import { SystemStatusLink } from "./SystemStatusLink";

describe("systemStatus/SystemStatusLink", () => {
  it("should display a link to our jira status page", () => {
    render(<SystemStatusLink />);
    const link = screen.getByText("System Status") as HTMLAnchorElement;
    expect(link).toBeDefined();
    expect(link.href).toBe("https://status.materialize.com/");
  });
});
