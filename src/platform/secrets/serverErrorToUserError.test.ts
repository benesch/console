import { serverErrorToUserError } from "./serverErrorToUserError";

describe("serverErrorToUserError", () => {
  it("server error with one set of quotations", () => {
    const serverError = "catalog item 'test_1' already exists";
    expect(serverErrorToUserError(serverError)).toBe(
      "A secret with the name test_1 already exists."
    );
  });

  it("server error with no quotations", () => {
    const serverError = "catalog item test_1 already exists";
    expect(serverErrorToUserError(serverError)).toBe(null);
  });

  it("server error with quotations but doesn't end with 'already exists'", () => {
    const serverError = "system item 'test_1' cannot be modified";
    expect(serverErrorToUserError(serverError)).toBe(null);
  });

  it("error message is undefined", () => {
    expect(serverErrorToUserError(undefined)).toBe(null);
  });
});
