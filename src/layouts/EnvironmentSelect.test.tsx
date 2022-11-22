import { render, screen } from "@testing-library/react";
import { rest } from "msw";
import React from "react";
import { RecoilRoot } from "recoil";

import globalConfigStub from "~/__mocks__/config";
import { hasEnvironmentReadPermission } from "~/api/auth";
import server from "~/api/mocks/server";
import EnvironmentSelect from "~/layouts/EnvironmentSelect";

// mock this before the test so that the current region gets set in recoil
jest.mock("../config", () => ({
  ...globalConfigStub,
  cloudRegions: new Map([
    [
      "AWS/us-east-1",
      {
        provider: "aws",
        region: "us-east-1",
        regionControllerUrl:
          "https://rc.us-east-1.aws.test.cloud.materialize.com",
      },
    ],
  ]),
}));
jest.mock("../api/auth");

const renderComponent = () => {
  return render(
    <RecoilRoot>
      <React.Suspense fallback="suspense-fallback">
        <div data-testid="wrapper">
          <EnvironmentSelect />
        </div>
      </React.Suspense>
    </RecoilRoot>
  );
};

const validAssigmentResponse = rest.get(
  "*/api/environmentassignment",
  (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          cluster: "mzcloud-staging-us-east-1-0",
          environmentControllerUrl:
            "https://ec.0.us-east-1.aws.staging.cloud.materialize.com:443",
        },
      ])
    );
  }
);

describe("EnvironmentSelect", () => {
  it("shows noting if you don't have environment permissions", async () => {
    (hasEnvironmentReadPermission as jest.Mock).mockReturnValue(false);
    renderComponent();

    expect(await screen.findByTestId("wrapper")).toBeEmptyDOMElement();
  });

  it("show nothing if you don't have any regions enabled", async () => {
    (hasEnvironmentReadPermission as jest.Mock).mockReturnValue(false);
    server.use(
      rest.get("*/api/environmentassignment", (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    renderComponent();

    expect(await screen.findByTestId("wrapper")).toBeEmptyDOMElement();
  });

  it("shows the current region and state", async () => {
    (hasEnvironmentReadPermission as jest.Mock).mockReturnValue(true);
    server.use(
      validAssigmentResponse,
      rest.get("*/api/environment", (_req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([
            {
              environmentdPgwireAddress:
                "47azz5yc00ab7xnu21b4p2evh.eu-west-1.aws.staging.materialize.cloud:6875",
              environmentdHttpsAddress:
                "47azz5yc00ab7xnu21b4p2evh.eu-west-1.aws.staging.materialize.cloud:443",
              resolvable: true,
              creationTimestamp: "2022-11-11T00:20:14Z",
            },
          ])
        );
      })
    );
    renderComponent();

    expect(await screen.findByTestId("wrapper")).toBeInTheDocument();
    expect(screen.getByText("AWS/us-east-1")).toBeVisible();
    expect(screen.getByTestId("health-healthy")).toBeVisible();
  });

  it("shows booting state", async () => {
    (hasEnvironmentReadPermission as jest.Mock).mockReturnValue(true);
    server.use(
      validAssigmentResponse,
      rest.get("*/api/environment", (_req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([
            {
              environmentdPgwireAddress:
                "47azz5yc00ab7xnu21b4p2evh.eu-west-1.aws.staging.materialize.cloud:6875",
              environmentdHttpsAddress:
                "47azz5yc00ab7xnu21b4p2evh.eu-west-1.aws.staging.materialize.cloud:443",
              resolvable: false,
              creationTimestamp: new Date().toISOString(),
            },
          ])
        );
      })
    );
    renderComponent();

    expect(await screen.findByTestId("wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("health-booting")).toBeVisible();
  });

  it("shows crashed state when environment is not resolvable", async () => {
    (hasEnvironmentReadPermission as jest.Mock).mockReturnValue(true);
    server.use(
      validAssigmentResponse,
      rest.get("*/api/environment", (_req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([
            {
              environmentdPgwireAddress:
                "47azz5yc00ab7xnu21b4p2evh.eu-west-1.aws.staging.materialize.cloud:6875",
              environmentdHttpsAddress:
                "47azz5yc00ab7xnu21b4p2evh.eu-west-1.aws.staging.materialize.cloud:443",
              resolvable: false,
              // because this data is more than 5 minutes ago, we show a crashed state
              creationTimestamp: "2022-11-11T00:20:14Z",
            },
          ])
        );
      })
    );
    renderComponent();

    expect(await screen.findByTestId("wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("health-crashed")).toBeVisible();
  });

  it("shows crashed state when there is a sql error", async () => {
    (hasEnvironmentReadPermission as jest.Mock).mockReturnValue(true);
    server.use(
      validAssigmentResponse,
      rest.get("*/api/environment", (_req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([
            {
              environmentdPgwireAddress:
                "47azz5yc00ab7xnu21b4p2evh.eu-west-1.aws.staging.materialize.cloud:6875",
              environmentdHttpsAddress:
                "47azz5yc00ab7xnu21b4p2evh.eu-west-1.aws.staging.materialize.cloud:443",
              resolvable: true,
              creationTimestamp: new Date().toISOString(),
            },
          ])
        );
      }),
      rest.post("*/api/sql", (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    renderComponent();

    expect(await screen.findByTestId("wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("health-crashed")).toBeVisible();
  });
});
