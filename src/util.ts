/**
 * @module
 * Generic utility functions.
 */

/**
 * @description
 * Takes an Array<V>, and a grouping function,
 * and returns a Map of the array grouped by the grouping function.
 *
 * @param list An array of type V.
 * @param keyGetter A Function that takes the the Array type V as an input, and returns a value of type K.
 *                  K is generally intended to be a property key of V.
 *
 * @returns Map of the array grouped by the grouping function.
 */
export function groupBy<K, V>(
  list: Array<V>,
  keyGetter: (input: V) => K
): Map<K, Array<V>> {
  const map = new Map<K, Array<V>>();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

/**
 * Asserts that the specified condition is truthy.
 *
 * Modeled after the function of the same name in Node.js.
 */
export function assert(condition: any): asserts condition {
  if (!condition) {
    throw new Error("assertion failed");
  }
}

/** Choose a random element from an array. */
export function randomChoice<T>(array: Array<T>) {
  return array[Math.floor(Math.random() * array.length)];
}

/** Create a promise that resolves after the specified number of milliseconds.
 *
 * For example, to sleep for one second in an asynchronous function:
 *
 * ```
 * await sleep(1000);
 * ```
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
