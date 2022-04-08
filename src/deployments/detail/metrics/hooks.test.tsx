import { waitFor } from "@testing-library/dom";
import { renderHook } from "@testing-library/react-hooks";
import parseISO from "date-fns/parseISO";

import { mockDate } from "../../../__mocks__/date";
import { PrometheusMetrics } from "../../../api/backend";
import { defaultMetricPeriod } from "./components/MetricPeriodSelector";
import { GetMetricsHook, useRetrieveMetrics } from "./hooks";

const refetch = jest.fn();
const hookReturns = {
  loading: {
    data: undefined as PrometheusMetrics | undefined,
    loading: true,
    error: undefined,
    refetch,
  },
  withData: {
    refetch,
    loading: false,
    error: undefined,
    data: {
      metrics: [
        {
          name: "value",
          values: [
            ["1588888888", "1"],
            ["1588888889", "2"],
          ],
        },
      ],
    } as PrometheusMetrics,
  },
};

const hook = jest.fn(() => hookReturns.loading);
const fakeNow = () => new Date(2021, 1, 1);

afterEach(() => {
  jest.clearAllMocks();
});

describe("metrics/hooks/useRetrieveMetrics", () => {
  jest.useFakeTimers();

  it("should query the backend with the correct deploymentId", () => {
    const deploymentId = "deploymentId";
    const { result } = renderHook(() =>
      useRetrieveMetrics(deploymentId, hook as unknown as GetMetricsHook)
    );

    expect(result.current.operation.loading).toBe(true);
    expect(hook).toHaveBeenCalledWith({
      id: deploymentId,
      period: defaultMetricPeriod,
    });
  });

  it("should return the api call hook result in the operation prop", () => {
    const { result } = renderHook(() =>
      useRetrieveMetrics("1", hook as unknown as GetMetricsHook)
    );

    expect(result.current.operation).toMatchObject({
      data: undefined,
      loading: true,
      error: undefined,
    });
  });
  it("should refetch the latest data every 30 seconds", () => {
    const { result } = renderHook(() =>
      useRetrieveMetrics("1", hook as unknown as GetMetricsHook)
    );
    expect(result.current.operation.refetch).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(29000);
    expect(result.current.operation.refetch).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(1500);
    expect(result.current.operation.refetch).toHaveBeenCalledTimes(1);
  });

  describe("chart", () => {
    it("should transform the api data into victory compatible format", () => {
      hook.mockImplementation(() => hookReturns.withData);
      const { result } = renderHook(() =>
        useRetrieveMetrics("1", hook as unknown as GetMetricsHook)
      );
      expect(result.current.chart.data).toEqual([
        {
          name: "value",
          values: [
            {
              x: parseISO("2020-05-07T22:01:28.000Z"),
              y: 1,
            },
            {
              x: parseISO("2020-05-07T22:01:29.000Z"),
              y: 2,
            },
          ],
        },
      ]);
    });
    it("should compute x/y domains for the chart", () => {
      mockDate(fakeNow());
      hook.mockImplementation(() => hookReturns.withData);
      const { result } = renderHook(() =>
        useRetrieveMetrics("1", hook as unknown as GetMetricsHook)
      );
      expect(result.current.chart.domains).toEqual({
        x: [new Date(2020, 5, 7), fakeNow()],
        y: [0, 2],
      });
    });
  });

  describe("filters", () => {
    it("changing the current query period should trigger a refetch", async () => {
      const { result } = renderHook(() =>
        useRetrieveMetrics("1", hook as unknown as GetMetricsHook)
      );
      hook.mockReset();
      result.current.filters.setPeriod(10);
      await waitFor(() => expect(hook).toHaveBeenCalledTimes(2));

      expect(hook).toHaveBeenLastCalledWith({ id: "1", period: 10 });
    });
  });
});
