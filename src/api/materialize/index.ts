import { sql } from "kysely";

import { assert, isTruthy, notNullOrUndefined } from "~/util";

/**
 * Named used to identify ourselves to the server, needs to be kept in sync with
 * the `ApplicationNameHint`.
 */
export const APPLICATION_NAME = "web_console";
export const DEFAULT_QUERY_ERROR = "Error running query.";

/**
 * Quotes a string to be used as a SQL identifier.
 * It is an error to call this function with a string that contains the zero code point.
 */
export function quoteIdentifier(id: string) {
  // According to https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS,
  // any string may be used as an identifier, except those that contain the zero code point.
  //
  // In order to support special characters, quoted identifiers must be used.
  // Within a quoted identifier, the literal double-quote character must be escaped
  // by writing it twice.
  // For example, the identifier foo" is represented as "foo""" (including the quotes).

  // Materialize never allows any identifiers to be used whose name contains the null byte,
  // so this assert should never fire unless this function is called with arbitrary user input.
  assert(id.search("\0") === -1);

  return `"${id.replace('"', '""')}"`;
}

/**
 * Given an array of sql expressions, builds a string of WHERE + AND clauses.
 * Also accepts and filters out undefined values for convenience.
 */
export function buildWhereConditions(expressions: Array<undefined | string>) {
  expressions = expressions.filter(isTruthy);
  return expressions.length > 0 ? `\nWHERE ${expressions.join("\nAND ")}` : "";
}

/**
 * Given an object name, prepend it with a namespace indicating is schema and database
 */
export function attachNamespace(
  name: string,
  databaseName: string,
  schemaName: string
): string {
  name = quoteIdentifier(name);
  const namespace = [databaseName, schemaName]
    .filter(notNullOrUndefined)
    .map(quoteIdentifier)
    .join(".");

  return namespace ? `${namespace}.${name}` : name;
}

export function escapedLiteral(literal: string) {
  // Materialize never allows any identifiers to be used whose name contains the null byte,
  // so this assert should never fire unless this function is called with arbitrary user input.
  assert(literal.search("\0") === -1);

  return sql.lit(literal.replace("'", "''"));
}

export function escapedIdentifier(identifier: string) {
  // Materialize never allows any identifiers to be used whose name contains the null byte,
  // so this assert should never fire unless this function is called with arbitrary user input.
  assert(identifier.search("\0") === -1);

  return sql.id(identifier.replace("'", "''"));
}
