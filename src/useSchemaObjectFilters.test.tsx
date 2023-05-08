import { act, renderHook, waitFor } from "@testing-library/react";

import server from "~/api/mocks/server";
import {
  createProviderWrapper,
  healthyEnvironment,
  setFakeEnvironment,
} from "~/test/utils";

import { buildUseSqlQueryHandler } from "./api/mocks/buildSqlQueryHandler";
import useSchemaObjectFilters from "./useSchemaObjectFilters";

jest.mock("~/api/auth");

const validUseDatabasesResponse = buildUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: ["id", "name"],
  rows: [
    ["u1", "materialize"],
    ["u2", "other_db"],
  ],
});
const validUseSchemaResponse = buildUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: ["id", "name", "database_id", "database_name"],
  rows: [
    ["u1", "public", "u1", "materialize"],
    ["u2", "public", "u2", "other_db"],
  ],
});

const ALL_OPTION = "0";
const NAME_FILTER_QUERY_STRING_KEY = "name";

describe("useSchemaObjectFilters", () => {
  beforeEach(() => {
    server.use(validUseDatabasesResponse);
    server.use(validUseSchemaResponse);
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
          id: "u1",
          name: "materialize",
        },
        {
          id: "u2",
          name: "other_db",
        },
      ]);
      expect(result.current.schemaFilter.schemaList).toEqual([
        {
          id: "u1",
          name: "public",
          databaseId: "u1",
          databaseName: "materialize",
        },
        {
          id: "u2",
          name: "public",
          databaseId: "u2",
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
