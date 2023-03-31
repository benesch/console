/**
 * A function that converts a server error message to a user friendly error message.
 */
export function serverErrorToUserError(errorString?: string) {
  if (!errorString) {
    return null;
  }

  /**
   * This regex takes a string and extracts a substring in single quotation marks
   * only if the sentence ends with "already exists".
   */
  const strInsideQuotesMatch = /'([^']*)'[\s\S]*already exists$/g.exec(
    errorString
  );

  if (strInsideQuotesMatch && strInsideQuotesMatch.length > 1) {
    return `A secret with the name ${strInsideQuotesMatch[1]} already exists.`;
  }

  return null;
}
