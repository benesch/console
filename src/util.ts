/**
 * @module
 * Generic utility functions.
 */

/**
 * Asserts that the specified condition is truthy.
 
 * Modeled after the function of the same name in Node.js.
 */
export function assert(condition: any): asserts condition {
  if (!condition) {
    throw new Error("assertion failed");
  }
}

/**
 * Detects the presence of ?noPoll query string parameter, which we use to disable
 * polling for development purposes.
 */
export function isPollingDisabled() {
  const params = new URLSearchParams(location.search);
  return Array.from(params.keys()).includes("noPoll");
}

/**
 * Determines if the user is an internal Materialize employee.
 *
 * This should only be used for displaying debugging information. It is not a valid method of security.
 */
export function isMzInternalEmail(email: string): boolean {
  return (
    email.endsWith("@materialize.com") || email.endsWith("@materialize.io")
  );
}
