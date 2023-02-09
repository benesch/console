import "@testing-library/jest-dom";

import debug from "debug";

import server from "./api/mocks/server";

const debugMz = debug("mz");

// Establish API mocking before all tests.
beforeAll(() => {
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
