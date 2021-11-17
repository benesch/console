import { fireEvent, RenderResult, screen } from "@testing-library/react";
import cloneDeep from "lodash/cloneDeep";
import { Response } from "miragejs";
import React from "react";

import {
  ApiLayerMock,
  createApiLayerMock,
  validDeploymentId,
} from "../../../api/__mocks__/api";
import { renderFragmentInTestMode } from "../../../utils/tests-utils";
import { validDeployment } from "../../__mocks__";
import { DeploymentMetricsCard } from ".";
import { CpuMetrics } from "./CpuMetrics";
import { MemoryMetrics } from "./MemoryMetrics";

const renderComponent =
  (metricType: "ram" | "cpu") => (deploymentId: string) => {
    const Cpt = metricType === "cpu" ? CpuMetrics : MemoryMetrics;
    return renderFragmentInTestMode(<Cpt deploymentId={deploymentId} />);
  };

const selectors = {
  lineChartContainer: () => screen.findByTestId("line-chart-container"),
  svgLineInVictorContainer: (node: RenderResult) =>
    node.container.querySelector(".VictoryContainer svg line"),
  fetchError: () => screen.findByTestId("fetch-deployment-metric-error"),
  periodSelector: () => screen.findByTestId("metrics-period-selector-dropdown"),
  metricsCard: () => screen.findByTestId("metrics-card"),
  metricsNotSupported: () =>
    screen.findByTestId("deployment-metrics-not-available-info"),
};

jest.mock("../../../api/auth", () => ({
  useAuth: jest.fn(() => ({ fetchedAuth: false })),
}));

describe("Metrics", () => {
  jest.useFakeTimers();
  let apiMock: ApiLayerMock | undefined;

  beforeEach(() => {
    apiMock = createApiLayerMock();
    apiMock.server.logging = true;
  });
  afterEach(() => {
    apiMock?.server.shutdown();
  });

  describe.only("card", () => {
    it("should not be displayed if the deployment is not in a supported region", async () => {
      const deploymentInEurope = cloneDeep(validDeployment);
      deploymentInEurope.cloudProviderRegion.region = "eu-west-1";
      renderFragmentInTestMode(
        <DeploymentMetricsCard deployment={deploymentInEurope} />
      );
      expect(await selectors.metricsNotSupported()).toBeDefined();
    });
  });

  describe.each(["ram", "cpu"] as ("ram" | "cpu")[])("%s", (metricName) => {
    it(`should display a ${metricName} utilization graph`, async () => {
      const node = renderComponent(metricName)(validDeploymentId);
      await selectors.lineChartContainer();
      expect(selectors.svgLineInVictorContainer(node)).toBeDefined();
    });

    it("should display an error message if the api call fails", async () => {
      apiMock?.handlers.getMetricsHandler.mockImplementation(() => {
        return new Response(500, {
          message: "Internal Server Error",
        });
      });

      renderComponent(metricName)(validDeploymentId);
      expect(await selectors.fetchError()).toBeDefined();
    });

    it("changing the period should refetch new data", async () => {
      renderComponent(metricName)(validDeploymentId);
      const newPeriod = (24 * 60).toString();

      const dropdown = await selectors.periodSelector();

      apiMock?.handlers.getMetricsHandler.mockReset();
      fireEvent.change(dropdown, { target: { value: newPeriod } });
      expect(apiMock?.handlers.getMetricsHandler).toHaveBeenCalledTimes(1);
    });
  });
});
