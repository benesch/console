import { rest } from "msw";

import { Error, SqlResult } from "~/api/materialize/types";
import { SqlStatement } from "~/api/materialized";

type ISQLQuery = {
  ok?: string;
  error?: Error;
};

type SQLSelectQuery = ISQLQuery & {
  type: "SELECT";
  columns: Array<string>;
  rows: Array<Array<unknown>>;
};

type SQLCreateQuery = ISQLQuery & {
  type: "CREATE";
};

type SQLCommitQuery = ISQLQuery & {
  type: "COMMIT";
};

type SQLDropQuery = ISQLQuery & {
  type: "DROP";
};

type SQLSetQuery = ISQLQuery & {
  type: "SET";
};

type SQLShowQuery = ISQLQuery & {
  type: "SHOW";
  column: string;
  rows: Array<Array<unknown>>;
};

type SQLShowCreateQuery = ISQLQuery & {
  type: "SHOW CREATE";
  name: string;
  createSql: string;
};

type SQLQuery =
  | SQLSelectQuery
  | SQLCreateQuery
  | SQLCommitQuery
  | SQLDropQuery
  | SQLSetQuery
  | SQLShowQuery
  | SQLShowCreateQuery;

function buildNotSurroundedByParensRegex(searchTerm: string) {
  /*
(?<!         - Negative lookbehind assertion: Assert that the previous characters do NOT match the following pattern:
  \([^)]*    - Match an opening parenthesis followed by zero or more non-closing parenthesis characters
)            - End of negative lookbehind assertion
searchTerm   - Match the searchTerm
(?!          - Negative lookahead assertion: Assert that the following characters do NOT match the following pattern:
  [^(]*      - Match zero or more non-opening parenthesis characters
  \)         - Match a closing parenthesis
)            - End of negative lookahead assertion
  */
  return new RegExp(`(?<!\\([^)]*)${searchTerm}(?![^(]*\\))`, "s");
}

/**
 * Simple implementation to extract SQL SELECT query column names.
 * There are four cases when it will extract:
 * 1) When a column name is prefixed with "AS", take the alias
 * 2) When a column name has a namespace (i.e. mz_internal.mz_compute_exports gives "mz_compute_exports")
 * 3) Standalone column names (i.e. "SELECT id from ..." gives "id")
 * 4) When a column name is a function call (i.e. SUM(...) gives "sum")
 * Does not account for DISTINCT, ALL, and nested CTEs
 * More documentation of SELECT's syntax tree can be found here: https://materialize.com/docs/sql/select/
 */
export function extractSQLSelectColumnNames(selectQueryStr: string) {
  const selectEndPosition =
    selectQueryStr
      .toUpperCase()
      .search(buildNotSurroundedByParensRegex("SELECT")) + "SELECT".length;
  const fromStartPosition = selectQueryStr
    .toUpperCase()
    .search(buildNotSurroundedByParensRegex("FROM\\s"));

  // For commas in functions (i.e. SELECT coalesce(records, 0) ...)
  const commaNotSurroundedByParensRegex = buildNotSurroundedByParensRegex(",");

  // Separate potential columns via commas
  const targetElemTokens = selectQueryStr
    .substring(selectEndPosition, fromStartPosition)
    .split(commaNotSurroundedByParensRegex)
    .map((el) => el.trim());

  const colNames = targetElemTokens.map((targetElemToken) => {
    const words = targetElemToken.split(" ").map((el) => el.trim());

    // Check for aliases
    const checkIfAs = (val: string) => val.toUpperCase() === "AS";
    const asPosition = words.findIndex(checkIfAs);
    if (asPosition !== -1) {
      const asCount = words.filter(checkIfAs).length;

      if (asCount > 1) {
        // The column's name is 'as' and has an alias
        return words[words.length - 1].replaceAll('"', "");
      }

      if (asCount === 1 && words.length === 1) {
        // The column's name is 'as' and has no alias
        return words[0].replaceAll('"', "");
      }

      return words[asPosition + 1].replaceAll('"', "");
    }

    /* Case where the column name is just a function call (i.e. COUNT(...)) */
    const wordInParensRegex = /\(([^)]*)\)/;
    const matches = wordInParensRegex.exec(targetElemToken);
    if (matches && matches.length > 0) {
      const firstParensPosition = targetElemToken.indexOf("(");
      return targetElemToken
        .substring(0, firstParensPosition)
        .toLowerCase()
        .replaceAll('"', "");
    }

    // When a column is prefixed by a table name
    const columnName = targetElemToken.split(".").pop();
    if (columnName === undefined) {
      throw new Error("Failed to parse column name");
    }
    return columnName.replaceAll('"', "");
  });

  return colNames;
}

export function getQueryType(sqlQuery: string) {
  for (const queryType of [
    "SHOW CREATE",
    "SELECT",
    "CREATE",
    "COMMIT",
    "DROP",
    "SET",
    "SHOW",
  ]) {
    // Since aliases and column names can contain these keywords, only match when they're standalone
    if (
      sqlQuery.toUpperCase().search(new RegExp(`${queryType}(\\s|;)`)) !== -1
    ) {
      return queryType;
    }
  }
}

/**
 * An MSW handler that intercepts API calls to our /api/sql endpoint and replaces the SQL queries
 * in the request with mock queries.
 *
 * The order and type of queries in "mockQueries" must be the same as the SQL queries in the request
 * otherwise MSW will skip this handler. This is to ensure we can mock multiple API calls during a test.
 *
 * When mocking a SELECT query, the mocked columns passed must match the column names returned from the API call.
 * You can check what these are through the networks tab.
 *
 * If this function ever returns undefined, MSW skips to the next handler.
 *
 * @param mockQueries - SQL queries we want to intercept and mock using MSW
 * @returns - An MSW handler that's response follows the endpoint's API response format: https://materialize.com/docs/integrations/http-api/.
 *
 */
export function buildSqlQueryHandler(mockQueries: Array<SQLQuery>) {
  return rest.post("*/api/sql", async (req, res, ctx) => {
    const results: SqlResult[] = [];

    const body = await req.json();
    if (body == null) {
      return undefined;
    }
    const { queries: requestQueries }: { queries: SqlStatement[] } = body;

    if (mockQueries.length !== requestQueries.length) {
      return undefined;
    }

    for (let i = 0; i < mockQueries.length; i++) {
      const mockQuery = mockQueries[i];
      const requestQuery = requestQueries[i].query;
      const requestQueryType = getQueryType(requestQuery);

      if (mockQuery.type !== requestQueryType) {
        return undefined;
      }

      switch (mockQuery.type) {
        case "SHOW CREATE":
          results.push({
            tag: `SELECT 1`,
            col_names: ["name", "create_sql"],
            rows: [[mockQuery.name, mockQuery.createSql]],
            notices: [],
          });

          break;
        case "SHOW": {
          const regex = new RegExp("SHOW (\\w*)");
          const requestShowVariableName = regex.exec(requestQuery)?.[1];
          const { column, rows } = mockQuery;

          if (column.toUpperCase() !== requestShowVariableName?.toUpperCase()) {
            return undefined;
          }

          // Replace the response with the rows from our mock query
          results.push({
            tag: `SELECT ${rows.length}`,
            col_names: [requestShowVariableName],
            rows: rows,
            notices: [],
          });

          break;
        }
        case "SELECT": {
          const requestQueryColNames =
            extractSQLSelectColumnNames(requestQuery);
          const { columns, rows } = mockQuery;

          // Ensure the column names returned from the API are the same order as the mock columns.
          if (
            JSON.stringify([...columns]).toUpperCase() !==
            JSON.stringify([...requestQueryColNames]).toUpperCase()
          ) {
            return undefined;
          }

          // Replace the response with the rows we input in our mock query.
          results.push({
            tag: `SELECT ${rows.length}`,
            col_names: requestQueryColNames,
            rows: rows,
            notices: [],
          });

          break;
        }
        default:
          results.push({
            ok: `${mockQuery.type};`,
            notices: [],
          });
      }

      // If there's a custom 'ok' or 'error' object, replace the last result with it
      if (mockQuery.ok) {
        results.pop();
        results.push({
          ok: mockQuery.ok,
          notices: [],
        });
      } else if (mockQuery.error) {
        results.pop();
        results.push({
          error: mockQuery.error,
          notices: [],
        });
      }
    }

    return res(ctx.status(200), ctx.json({ results }));
  });
}

/**
 * A wrapper over buildSqlQueryHandler.
 * Returns a handler that mocks requests from useSqlLazy and useSql.
 * @param mockQuery - SQL query to mock
 * @returns
 */

export function buildUseSqlQueryHandler(mockQuery: SQLQuery) {
  // The hooks above use only a single query and set the cluster to "mz_introspection" first.
  const queries = [mockQuery];
  return buildSqlQueryHandler(queries);
}
