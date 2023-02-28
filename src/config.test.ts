import { getCurrentStack, getFronteggUrl } from "./config";

describe("getCurrentStack", () => {
  beforeEach(() => {
    window.localStorage.removeItem("mz-current-stack");

    Object.defineProperty(window, "location", {
      writable: true,
      value: { assign: jest.fn() },
    });
  });

  it("should return the default if no local storage value is set", () => {
    const stack = getCurrentStack();
    expect(stack).toEqual("test");
  });

  it("should return the local storage value if it's set", () => {
    window.localStorage.setItem("mz-current-stack", "local");
    const stack = getCurrentStack();
    expect(stack).toEqual("local");
  });

  it("should staging if the there is no local storage value and the url is staging", () => {
    window.location.hostname = "staging.console.materialize.com";
    const stack = getCurrentStack();
    expect(stack).toEqual("staging");
  });

  it("should return the local storage value if it's set", () => {
    window.localStorage.setItem("mz-current-stack", "local");
    const stack = getCurrentStack();
    expect(stack).toEqual("local");
  });
});

describe("getFronteggUrl", () => {
  it("production stack should return the production url", () => {
    expect(getFronteggUrl("production")).toEqual(
      "https://admin.cloud.materialize.com"
    );
  });

  it("staging stack should return the staging url", () => {
    expect(getFronteggUrl("staging")).toEqual(
      "https://admin.staging.cloud.materialize.com"
    );
  });

  it("local stack should return the staging url", () => {
    expect(getFronteggUrl("local")).toEqual(
      "https://admin.staging.cloud.materialize.com"
    );
  });

  it("personal stack should return the personal stack url", () => {
    expect(getFronteggUrl("someuser.dev")).toEqual(
      "https://admin.someuser.dev.cloud.materialize.com"
    );
  });
});
