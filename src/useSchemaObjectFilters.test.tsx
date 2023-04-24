import { act, renderHook, waitFor } from "@testing-library/react";
import { rest } from "msw";

import { SqlRequest } from "~/api/materialized";
import server from "~/api/mocks/server";
import {
  createProviderWrapper,
  healthyEnvironment,
  setFakeEnvironment,
} from "~/test/utils";

import useSchemaObjectFilters from "./useSchemaObjectFilters";

jest.mock("~/api/auth");

const validSchemaObjectFilterResponses = rest.post(
  "*/api/sql",
  async (req, res, ctx) => {
    const { queries } = (await req.json()) as SqlRequest;
    if (queries.some((q) => q.query.includes("FROM mz_databases"))) {
      return res(
        ctx.status(200),
        ctx.json({
          results: [
            { ok: "SET", notices: [] },
            {
              tag: "SELECT 1",
              rows: [
                [1, "materialize"],
                [2, "other_db"],
              ],
              col_names: ["id", "name"],
              notices: [],
            },
          ],
        })
      );
    }
    if (queries.some((q) => q.query.includes("FROM mz_schemas"))) {
      return res(
        ctx.status(200),
        ctx.json({
          results: [
            { ok: "SET", notices: [] },
            {
              tag: "SELECT 2",
              rows: [
                [1, "public", 1, "materialize"],
                [2, "public", 2, "other_db"],
              ],
              col_names: ["id", "name", "database_id", "database_name"],
              notices: [],
            },
          ],
        })
      );
    }
    throw new Error("Query not matched");
  }
);

const ALL_OPTION = "0";
const NAME_FILTER_QUERY_STRING_KEY = "name";

describe("useSchemaObjectFilters", () => {
  beforeEach(() => {
    server.use(validSchemaObjectFilterResponses);
    history.pushState(undefined, "", "/");
  });

  it("loads databases and schemas", async () => {
    const ProviderWrapper = createProviderWrapper({
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });
    const { result } = renderHook(
      () => useSchemaObjectFilters(NAME_FILTER_QUERY_STRING_KEY),
      {
        wrapper: ProviderWrapper,
      }
    );
    await waitFor(() => {
      expect(result.current.databaseFilter.databaseList).toEqual([
        {
          id: 1,
          name: "materialize",
        },
        {
          id: 2,
          name: "other_db",
        },
      ]);
      expect(result.current.schemaFilter.schemaList).toEqual([
        {
          id: 1,
          name: "public",
          databaseId: 1,
          databaseName: "materialize",
        },
        {
          id: 2,
          name: "public",
          databaseId: 2,
          databaseName: "other_db",
        },
      ]);
    });
  });

  it("namespace includes database and schema when a schema is selected", async () => {
    const ProviderWrapper = createProviderWrapper({
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });
    const { result } = renderHook(
      () => useSchemaObjectFilters(NAME_FILTER_QUERY_STRING_KEY),
      {
        wrapper: ProviderWrapper,
      }
    );
    await waitFor(() => {
      expect(result.current.databaseFilter.databaseList).not.toBeNull();
      expect(result.current.schemaFilter.schemaList).not.toBeNull();
    });
    act(() => {
      result.current.schemaFilter.setSelectedSchema("u1");
    });
    await waitFor(() => {
      expect(location.search).toBe("?namespace=materialize.public");
    });
  });

  it("resets the schema filter when setting a different database", async () => {
    history.pushState(undefined, "", "?namespace=materialize.public");
    const ProviderWrapper = createProviderWrapper({
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });
    const { result } = renderHook(
      () => useSchemaObjectFilters(NAME_FILTER_QUERY_STRING_KEY),
      {
        wrapper: ProviderWrapper,
      }
    );
    await waitFor(() => {
      expect(result.current.databaseFilter.databaseList).not.toBeNull();
      expect(result.current.schemaFilter.schemaList).not.toBeNull();
    });
    await act(async () => {
      result.current.databaseFilter.setSelectedDatabase("u2");
    });
    await waitFor(() => expect(location.search).toBe("?namespace=other_db"));
  });

  it("removes the query string value when resetting the filter", async () => {
    history.pushState(undefined, "", "?namespace=materialize.public");
    const ProviderWrapper = createProviderWrapper({
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });
    const { result } = renderHook(
      () => useSchemaObjectFilters(NAME_FILTER_QUERY_STRING_KEY),
      {
        wrapper: ProviderWrapper,
      }
    );
    await waitFor(() => {
      expect(result.current.databaseFilter.databaseList).not.toBeNull();
      expect(result.current.schemaFilter.schemaList).not.toBeNull();
    });
    await act(async () => {
      result.current.databaseFilter.setSelectedDatabase(ALL_OPTION);
    });
    await waitFor(() => expect(location.search).toBe(""));
  });
});
