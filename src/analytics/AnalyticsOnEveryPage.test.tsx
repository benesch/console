import { useAuth } from "@frontegg/react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";

import AnalyticsOnEveryPage from "~/analytics/AnalyticsOnEveryPage";
import segment from "~/analytics/segment";

jest.mock("~/config");
jest.mock("~/analytics/segment");

const setupRenderTree = () => {
  const Home = () => {
    const navigate = useNavigate();
    return (
      <div>
        home<button onClick={() => navigate("/somewhere")}>go somewhere</button>
      </div>
    );
  };
  const renderResult = render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="somewhere" element={<div>somewhere</div>} />
      </Routes>
      <AnalyticsOnEveryPage />
    </MemoryRouter>
  );

  return {
    renderResult,
  };
};

const fakeAuth = { user: { id: "123" } };
jest.mock("@frontegg/react", () => ({
  useAuth: jest.fn(() => fakeAuth),
}));

describe("analytics/AnalyticsOnEveryPage", () => {
  it("should emit an analytics `page` event when the router's location changes", async () => {
    const { renderResult } = setupRenderTree();
    // initial page

    const button = await renderResult.findByRole("button");
    await userEvent.click(button);

    // So we have a component without any kind of returned node,
    // so testing library is not helpful, as it cannot target a "visible element"
    // we use wait for as an escape hatch to "retry" the condition until it succeeds or a predefined timer expires
    // the page event is called twice, once at page load and once at page change
    await waitFor(() => expect(segment.page).toHaveBeenCalledTimes(2));
  });

  it("should identify the user if valid auth is available", () => {
    setupRenderTree();
    expect(segment.identify).toHaveBeenCalledWith("123");
  });

  it("should reset user tracking if authentication is not valid anymore", () => {
    (useAuth as jest.Mock).mockImplementationOnce(() => ({ user: null }));
    setupRenderTree();
    expect(segment.reset).toHaveBeenCalledTimes(1);
  });
});
