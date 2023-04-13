/**
 * Looks for "object already exists" error messages and returns the object name
 * @returns string object name or null
 */
export function alreadyExistsError(errorMessage?: string) {
  if (!errorMessage) {
    return null;
  }

  /**
   * This regex takes a string and extracts a substring in single quotation marks
   * only if the sentence ends with "already exists".
   */
  const strInsideQuotesMatch = /'([^']*)'[\s\S]*already exists$/g.exec(
    errorMessage
  );

  if (strInsideQuotesMatch && strInsideQuotesMatch.length > 1) {
    return strInsideQuotesMatch[1];
  }

  return null;
}
