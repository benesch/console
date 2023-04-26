import createSourceStatement from "./createSourceStatement";

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
      cluster: { id: "u1", name: "default", replicas: [] },
      publication: "mz_publication",
      allTables: true,
      tables: [{ name: "not_used", alias: "" }],
    });
    expect(statement).toEqual(
      `
CREATE SOURCE pg_source
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
      cluster: { id: "u1", name: "default", replicas: [] },
      publication: "mz_publication",
      allTables: false,
      tables: [
        { name: "first", alias: "one" },
        { name: "second", alias: "" },
      ],
    });
    expect(statement).toEqual(
      `
CREATE SOURCE pg_source
IN CLUSTER default
FROM POSTGRES CONNECTION "pg_conn" (PUBLICATION 'mz_publication')
FOR TABLES (
"first" AS "one",
"second");`
    );
  });
  it("generates a valid statement with a namespace", () => {
    const statement = createSourceStatement({
      name: "pg_source",
      connection: {
        id: "u1",
        type: "postgres",
        name: "pg_conn",
        databaseName: "materialize",
        schemaName: "public",
      },
      database: { id: "1", name: "production" },
      schema: {
        id: "1",
        name: "marketing",
        databaseId: "1",
        databaseName: "production",
      },
      cluster: { id: "u1", name: "default", replicas: [] },
      publication: "mz_publication",
      allTables: true,
      tables: [],
    });
    expect(statement).toEqual(
      `
CREATE SOURCE "production"."marketing".pg_source
IN CLUSTER default
FROM POSTGRES CONNECTION "pg_conn" (PUBLICATION 'mz_publication')
FOR ALL TABLES;`
    );
  });
});
