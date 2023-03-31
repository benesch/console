import { getCurrentStack, getFronteggUrl, getSyncServerUrl } from "./config";

describe("getCurrentStack", () => {
  beforeEach(() => {
    window.localStorage.removeItem("mz-current-stack");
  });

  it("should return the default if no local storage value is set", () => {
    const stack = getCurrentStack("localhost");
    expect(stack).toEqual("test");
  });

  it("should return the local storage value if it's set", () => {
    window.localStorage.setItem("mz-current-stack", "local");
    const stack = getCurrentStack("localhost");
    expect(stack).toEqual("local");
  });

  it("should return staging if the there is no local storage value and the url is staging", () => {
    const stack = getCurrentStack("staging.console.materialize.com");
    expect(stack).toEqual("staging");
  });

  it("should return staging if the there is no local storage value and it's a preview url", () => {
    const stack = getCurrentStack(
      "branch-name.preview.console.materialize.com"
    );
    expect(stack).toEqual("staging");
  });

  it("should return the local storage value if it's set", () => {
    window.localStorage.setItem("mz-current-stack", "local");
    const stack = getCurrentStack("localhost");
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

describe("getSyncServerUrl", () => {
  it("production stack should return the production url", () => {
    expect(getSyncServerUrl("production")).toEqual(
      "https://sync.cloud.materialize.com"
    );
  });

  it("staging stack should return the staging url", () => {
    expect(getSyncServerUrl("staging")).toEqual(
      "https://sync.staging.cloud.materialize.com"
    );
  });

  it("local stack should return the staging url", () => {
    expect(getSyncServerUrl("local")).toEqual(
      "https://sync.staging.cloud.materialize.com"
    );
  });

  it("personal stack should return the personal stack url", () => {
    expect(getSyncServerUrl("someuser.dev")).toEqual(
      "https://sync.someuser.dev.cloud.materialize.com"
    );
  });
});
