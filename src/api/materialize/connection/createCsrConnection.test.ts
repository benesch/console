import { createCsrConnectionStatement } from "./createCsrConnection";

describe("createCsrConnectionStatement", () => {
  it("generates a valid statement no SSL options", () => {
    const statement = createCsrConnectionStatement({
      name: "crs_connection",
      url: "https://rp-f00000bar.data.vectorized.cloud:30993",
      databaseName: "materialize",
      schemaName: "public",
      username: { secretTextValue: "csr_user" },
      password: {
        secretName: "csr_password_secret",
        databaseName: "materialize",
        schemaName: "public",
      },
    });
    expect(statement).toEqual(
      `
CREATE CONNECTION "materialize"."public"."crs_connection" TO CONFLUENT SCHEMA REGISTRY (
URL 'https://rp-f00000bar.data.vectorized.cloud:30993',
USERNAME 'csr_user',
PASSWORD SECRET "materialize"."public"."csr_password_secret"
);`
    );
  });

  it("generates a valid statement with all SSL options", () => {
    const statement = createCsrConnectionStatement({
      name: "crs_connection",
      url: "https://rp-f00000bar.data.vectorized.cloud:30993",
      databaseName: "materialize",
      schemaName: "public",
      username: { secretTextValue: "csr_user" },
      password: {
        secretName: "csr_password_secret",
        databaseName: "materialize",
        schemaName: "public",
      },
      sslKey: {
        secretName: "ssl_key_secret",
        databaseName: "materialize",
        schemaName: "public",
      },
      sslCertificate: {
        secretName: "ssl_cert_secret",
        databaseName: "materialize",
        schemaName: "public",
      },
      sslCertificateAuthority: {
        secretName: "ssl_ca_secret",
        databaseName: "materialize",
        schemaName: "public",
      },
    });
    expect(statement).toEqual(
      `
CREATE CONNECTION "materialize"."public"."crs_connection" TO CONFLUENT SCHEMA REGISTRY (
URL 'https://rp-f00000bar.data.vectorized.cloud:30993',
USERNAME 'csr_user',
PASSWORD SECRET "materialize"."public"."csr_password_secret",
SSL KEY SECRET "materialize"."public"."ssl_key_secret",
SSL CERTIFICATE SECRET "materialize"."public"."ssl_cert_secret",
SSL CERTIFICATE AUTHORITY SECRET "materialize"."public"."ssl_ca_secret"
);`
    );
  });
});
