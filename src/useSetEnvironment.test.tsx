import { render, screen } from "@testing-library/react";
import React from "react";
import { RecoilRoot, useRecoilValue } from "recoil";

import { currentEnvironmentIdState } from "./recoil/environments";
import useSetEnvironment from "./useSetEnvironment";

const TestComponent = () => {
  const currentEnvironmentId = useRecoilValue(currentEnvironmentIdState);
  useSetEnvironment();
  return <div data-testid="currentEnvironmentId">{currentEnvironmentId}</div>;
};

describe("useSetEnvironment", () => {
  it("should do nothing if there is no region set in local storage", async () => {
    render(
      <RecoilRoot>
        <TestComponent />
      </RecoilRoot>
    );
    expect(
      await screen.findByTestId("currentEnvironmentId")
    ).toBeEmptyDOMElement();
  });

  it("should set the environment based on the value in local storage", async () => {
    window.localStorage.setItem("mz-selected-region", "test");
    render(
      <RecoilRoot>
        <TestComponent />
      </RecoilRoot>
    );
    expect(await screen.findByTestId("currentEnvironmentId")).toHaveTextContent(
      "test"
    );
  });
});
