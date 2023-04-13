import { alreadyExistsError } from "~/api/materialize/parseErrors";

/**
 * A function that converts a server error message to a user friendly error message.
 */
export function serverErrorToUserError(errorString?: string) {
  if (!errorString) {
    return null;
  }

  const objectName = alreadyExistsError(errorString);
  if (objectName) {
    return "A secret with that name already exists.";
  }

  return null;
}
