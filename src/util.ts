/**
 * @module
 * Generic utility functions.
 */

import petnames from "../../config/petnames.json";

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

/**
 * Generate a "pet name".
 *
 * A pet name consists of an adjective and animal name, separated by a hyphen,
 * and all lowercase. They are useful as unique handles that are human readable.
 *
 * If you change this function, change the Python implementation in
 * console.util.nameutil to match.
 * */
export function petname() {
  const adjective = randomChoice(petnames["adjectives"]);
  const animal = randomChoice(petnames["animals"]);
  return `${adjective}-${animal}`;
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
