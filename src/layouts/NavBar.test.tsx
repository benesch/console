import { isSubroute } from "./NavBar";

describe("isSubroute", () => {
  it("should return true if the subroute matches exactly with the route", () => {
    expect(isSubroute("/users", "/users")).toBe(true);
  });

  it("should return true if the potential subroute has the same path segments as the route", () => {
    expect(isSubroute("/users/", "/users/123")).toBe(true);
    expect(isSubroute("/users", "/users/123")).toBe(true);
    expect(isSubroute("/users", "users/123")).toBe(true);
  });

  it("should return true if potential subroute has query params", () => {
    expect(isSubroute("/users/", "/users/?search=5")).toBe(true);
    expect(isSubroute("/users/", "/users/123?search=5")).toBe(true);
  });

  it("should return false if the potential subroute does not have the same path segments as the route", () => {
    expect(isSubroute("/posts", "/users")).toBe(false);
    expect(isSubroute("/users/123", "/users")).toBe(false);
  });
});
