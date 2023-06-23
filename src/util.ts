/**
 * @module
 * Generic utility functions.
 */

import { formatInTimeZone } from "date-fns-tz";

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

/**
 * Returns true unless an object is null or undefined and narrows the type correctly.
 */
export function notNullOrUndefined<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/**
 * Returns truthiness of any object and narrows the type correctly.
 */
export function isTruthy<T>(
  value?: T | undefined | null | false | "" | 0
): value is T {
  return !!value;
}

export function formatTimeInUtc(
  timestampOrDate: number | Date,
  format?: string
) {
  return formatInTimeZone(timestampOrDate, "UTC", format ?? "HH:mm:ss");
}
