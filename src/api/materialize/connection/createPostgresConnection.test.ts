import createPostgresConnectionStatement from "./createPostgresConnection";

describe("createPostgresConnectionStatement", () => {
  it("generates a valid statement", () => {
    const statement = createPostgresConnectionStatement({
      name: "pg_connection",
      databaseName: "materialize",
      schemaName: "public",
      host: "example.com",
      pgDatabaseName: "postgres",
      user: "user",
      port: "5432",
      password: {
        secretValue: '"materialize"."public"."secret_1"',
      },
      sslMode: "require",
      sslKey: {
        secretValue: '"materialize"."public"."secret_1"',
      },
      sslCertificate: {
        isText: true,
        secretValue: "MIICzjCCAbeg...",
      },
      sslCertificateAuthority: {
        secretValue: '"materialize"."public"."secret_1"',
      },
    });
    expect(statement).toEqual(`
CREATE CONNECTION "materialize"."public"."pg_connection" TO POSTGRES
(
HOST 'example.com',
DATABASE 'postgres',
USER 'user',
PORT 5432,
PASSWORD SECRET "materialize"."public"."secret_1",
SSL MODE 'require',
SSL KEY SECRET "materialize"."public"."secret_1",
SSL CERTIFICATE 'MIICzjCCAbeg...',
SSL CERTIFICATE AUTHORITY SECRET "materialize"."public"."secret_1"
);`);
  });

  it("filters out undefined connection creation parameters", () => {
    const statement = createPostgresConnectionStatement({
      name: "pg_connection",
      databaseName: "materialize",
      schemaName: "public",
      host: "example.com",
      pgDatabaseName: "postgres",
      user: "user",
      port: undefined,
      password: undefined,
      sslMode: undefined,
      sslKey: undefined,
      sslCertificate: undefined,
      sslCertificateAuthority: undefined,
    });
    expect(statement).toEqual(
      `
CREATE CONNECTION "materialize"."public"."pg_connection" TO POSTGRES
(
HOST 'example.com',
DATABASE 'postgres',
USER 'user'
);`
    );
  });
});
