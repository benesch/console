import { rest } from "msw";

import { SqlStatement } from "~/api/materialized";

type ISQLQuery = {
  ok?: string;
  error?: string;
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
};

type SQLQuery =
  | SQLSelectQuery
  | SQLCreateQuery
  | SQLCommitQuery
  | SQLDropQuery
  | SQLSetQuery
  | SQLShowQuery;

function genNotSurroundedByParensRegex(searchTerm: string) {
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
      .search(genNotSurroundedByParensRegex("SELECT")) + "SELECT".length;
  const fromStartPosition = selectQueryStr
    .toUpperCase()
    .search(genNotSurroundedByParensRegex("(\n| )FROM(\n| )"));

  // For commas in functions (i.e. SELECT coalesce(records, 0) ...)
  const commaNotSurroundedByParensRegex = genNotSurroundedByParensRegex(",");

  const targetElemTokens = selectQueryStr
    .substring(selectEndPosition, fromStartPosition)
    .split(commaNotSurroundedByParensRegex)
    .map((el) => el.trim());

  const colNames = targetElemTokens.map((targetElemToken) => {
    const words = targetElemToken.split(" ").map((el) => el.trim());

    const asPosition = words.findIndex((val) => val.toUpperCase() === "AS");
    if (asPosition !== -1) {
      return words[asPosition + 1];
    }

    /* Case where the column name is just a function call (i.e. COUNT(...)) */
    const wordInParensRegex = /\(([^)]*)\)/;
    const matches = wordInParensRegex.exec(targetElemToken);
    if (matches && matches.length > 0) {
      const firstParensPosition = targetElemToken.indexOf("(");
      return targetElemToken.substring(0, firstParensPosition).toLowerCase();
    }

    // When a column is prefixed by a table name
    return targetElemToken.split(".").pop();
  });

  return colNames;
}

export function getQueryType(sqlQuery: string) {
  // Make sure SELECT is the last query type in this iterable since other query commands can include SELECT
  for (const queryType of [
    "CREATE",
    "COMMIT",
    "DROP",
    "SET",
    "SHOW",
    "SELECT",
  ]) {
    if (sqlQuery.toUpperCase().includes(queryType)) {
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
export function genSqlQueryHandler(mockQueries: Array<SQLQuery>) {
  return rest.post("*/api/sql", async (req, res, ctx) => {
    const results = [];

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
        case "SELECT": {
          const requestQueryColNames =
            extractSQLSelectColumnNames(requestQuery);
          const { columns, rows } = mockQuery;

          // Ensure the column names returned from the API are the same order as the mock columns.
          if (
            JSON.stringify([...columns].sort()).toUpperCase() !==
            JSON.stringify([...requestQueryColNames].sort()).toUpperCase()
          ) {
            return undefined;
          }

          // Make mock rows and columns the same order as the request columns
          const sortedRows = [...rows];

          for (let j = 0; j < sortedRows.length; j++) {
            sortedRows[j] = [...sortedRows[j]];
            const sortedRow = sortedRows[j];

            sortedRow.sort((a, b) => {
              const aIndex = sortedRow.indexOf(a);
              const bIndex = sortedRow.indexOf(b);

              const colA = columns[aIndex];
              const colB = columns[bIndex];

              return (
                requestQueryColNames.indexOf(colA) -
                requestQueryColNames.indexOf(colB)
              );
            });
          }

          // Replace the response with the rows we input in our mock query.
          results.push({
            tag: `SELECT ${rows.length}`,
            col_names: requestQueryColNames,
            rows: sortedRows,
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
 * A wrapper over genSqlQueryHandler.
 * Returns a handler that mocks requests from useSqlLazy and useSql.
 * @param mockQuery - SQL query to mock
 * @returns
 */

export function genUseSqlQueryHandler(mockQuery: SQLQuery) {
  // The hooks above use only a single query and set the cluster to "mz_introspection" first.
  const queries = [{ type: "SET" as const }, mockQuery];
  return genSqlQueryHandler(queries);
}
