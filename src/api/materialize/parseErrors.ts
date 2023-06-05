/**
 * Looks for "object already exists" error messages and returns the object name
 * @returns string object name or null
 */
export function alreadyExistsError(errorMessage?: string) {
  if (!errorMessage) {
    return null;
  }

  /**
   * This regex takes a string and extracts a substring in single or double quotation marks
   * only if the sentence ends with "already exists".
   */
  const strInsideQuotesMatch = /['"]([^'"]*)['"][\s\S]*already exists$/g.exec(
    errorMessage
  );

  if (strInsideQuotesMatch && strInsideQuotesMatch.length > 1) {
    return strInsideQuotesMatch[1];
  }

  return null;
}

/**
 * Looks for "cannot create multiple replicas named" error messages and returns the object name
 * @returns string object name or null
 */
export function duplicateReplicaName(errorMessage?: string) {
  if (!errorMessage) {
    return null;
  }

  /**
   * This regex takes a string and extracts a substring in single or double quotation marks
   * only if the sentence ends with "already exists".
   */
  const strInsideQuotesMatch =
    /cannot create multiple replicas named ['"]([^'"]*)['"][\s\S]*on cluster '.*'$/g.exec(
      errorMessage
    );

  if (strInsideQuotesMatch && strInsideQuotesMatch.length > 1) {
    return strInsideQuotesMatch[1];
  }

  return null;
}
