import { alreadyExistsError } from "./parseErrors";

describe("alreadyExistsError", () => {
  it("server error with a quoted name and the text 'already exists'", () => {
    const serverError = "catalog item 'test_1' already exists";
    expect(alreadyExistsError(serverError)).toBe("test_1");
  });

  it("server error with no quotations", () => {
    const serverError = "catalog item test_1 already exists";
    expect(alreadyExistsError(serverError)).toBe(null);
  });

  it("server error with quotations but doesn't end with 'already exists'", () => {
    const serverError = "system item 'test_1' cannot be modified";
    expect(alreadyExistsError(serverError)).toBe(null);
  });

  it("error message is undefined", () => {
    expect(alreadyExistsError(undefined)).toBe(null);
  });
});
