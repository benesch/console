import createSourceStatement from "./createSourceStatement";

const database = {
  id: "u1",
  name: "materialize",
};
const schema = {
  id: "u1",
  name: "public",
  databaseId: "u1",
  databaseName: "materialize",
};

describe("createSourceStatement", () => {
  it("generates a valid statement with all tables", () => {
    const statement = createSourceStatement({
      name: "pg_source",
      connection: {
        id: "u1",
        type: "postgres",
        name: "pg_conn",
        databaseName: "materialize",
        schemaName: "public",
      },
      database,
      schema,
      cluster: { id: "u1", name: "default", replicas: [] },
      clusterSize: null,
      publication: "mz_publication",
      allTables: true,
      tables: [{ name: "not_used", alias: "" }],
    });
    expect(statement).toEqual(
      `
CREATE SOURCE "materialize"."public".pg_source
IN CLUSTER default
FROM POSTGRES CONNECTION "pg_conn" (PUBLICATION 'mz_publication')
FOR ALL TABLES;`
    );
  });

  it("generates a valid statement with individual tables", () => {
    const statement = createSourceStatement({
      name: "pg_source",
      connection: {
        id: "u1",
        type: "postgres",
        name: "pg_conn",
        databaseName: "materialize",
        schemaName: "public",
      },
      database,
      schema,
      cluster: { id: "u1", name: "default", replicas: [] },
      clusterSize: null,
      publication: "mz_publication",
      allTables: false,
      tables: [
        { name: "first", alias: "one" },
        { name: "second", alias: "" },
      ],
    });
    expect(statement).toEqual(
      `
CREATE SOURCE "materialize"."public".pg_source
IN CLUSTER default
FROM POSTGRES CONNECTION "pg_conn" (PUBLICATION 'mz_publication')
FOR TABLES (
"first" AS "one",
"second");`
    );
  });

  it("generates a valid statement when creating a cluster", () => {
    const statement = createSourceStatement({
      name: "pg_source",
      connection: {
        id: "u1",
        type: "postgres",
        name: "pg_conn",
        databaseName: "materialize",
        schemaName: "public",
      },
      database,
      schema,
      cluster: { id: "0", name: "Create new", replicas: [] },
      clusterSize: { id: "3xsmall", name: "3xsmall" },
      publication: "mz_publication",
      allTables: true,
      tables: [],
    });
    expect(statement).toEqual(
      `
CREATE SOURCE "materialize"."public".pg_source
FROM POSTGRES CONNECTION "pg_conn" (PUBLICATION 'mz_publication')
FOR ALL TABLES
WITH (SIZE = '3xsmall');`
    );
  });
});
