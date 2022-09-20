import { Environment } from "../api/environment-controller";

/**
 * Returns the default environment from a region environment
 * @param {Array<Environment> | null} environments
 * @returns {Environment}
 */
function getDefaultEnvironment(
  environments: Array<Environment> | null
): Environment | null {
  return environments && environments.length > 0 ? environments[0] : null;
}

export default getDefaultEnvironment;
