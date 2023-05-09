/**
 * Matches valid postgres / materialize identifiers
 */
export const MATERIALIZE_DATABASE_IDENTIFIER_REGEX = /^[_a-z][\d$_a-z]*$/i;

/**
 * Matches an http or https string with subdomains and port numbers.
 * An example: https://rp-f00000bar.data.vectorized.cloud:30993/
 */
export const HTTP_URL_WITH_EXPLICIT_ROOT_PATH_REGEX =
  /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(:\d+)?(\/*)?$/;
