import "@testing-library/jest-dom";

import debug from "debug";
import { mockFlags } from "jest-launchdarkly-mock";

import server from "./api/mocks/server";

const debugMz = debug("mz");

// Mocks

jest.mock("~/analytics/segment", () => {
  // No official mock of segment. Methods copied from https://segment.com/docs/connections/spec/
  return {
    segment: {
      identify: jest.fn(),
      page: jest.fn(),
      track: jest.fn(),
      screen: jest.fn(),
      group: jest.fn(),
      alias: jest.fn(),
      load: jest.fn(),
      reset: jest.fn(),
    },
    useSegment: () => ({
      track: jest.fn(),
    }),
    useSegmentPageTracking: jest.fn(),
  };
});
jest.mock("~/hooks/useBootIntercom");

// Establish API mocking before all tests.
beforeAll(() => {
  mockFlags({});

  if (debugMz.enabled) {
    server.events.on("request:start", (req) => {
      debugMz(`[request] ${req.method}, ${req.url.href}`, req.body);
    });
  }

  server.listen();
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => {
  server.events.removeAllListeners();
  server.close();
});

export {};
