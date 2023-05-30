import { EnabledEnvironment } from "~/recoil/environments";

import { attachNamespace } from "..";
import createConnection from "./createConnection";
import { Secret, TextSecret } from "./types";

export interface CreatePostgresConnectionParameters {
  name: string;
  databaseName: string;
  schemaName: string;
  host: string;
  pgDatabaseName: string;
  user: string;
  port?: string;
  password?: Secret | TextSecret;
  sslMode?: string;
  sslKey?: Secret | TextSecret;
  sslCertificate?: Secret | TextSecret;
  sslCertificateAuthority?: Secret | TextSecret;
}

export const createPostgresConnectionStatement = (
  params: CreatePostgresConnectionParameters
) => {
  const name = attachNamespace(
    params.name,
    params.databaseName,
    params.schemaName
  );

  const options: [string, string | Secret | TextSecret | undefined][] = [
    ["HOST", params.host],
    ["DATABASE", params.pgDatabaseName],
    ["USER", params.user],
    ["PORT", params.port],
    ["PASSWORD", params.password],
    ["SSL MODE", params.sslMode],
    ["SSL KEY", params.sslKey],
    ["SSL CERTIFICATE", params.sslCertificate],
    ["SSL CERTIFICATE AUTHORITY", params.sslCertificateAuthority],
  ];

  const optionsString = options
    .filter(
      (option): option is [string, string | Secret | TextSecret] => !!option[1]
    )
    .map(([key, val]) => {
      // PORT is an integer and we shouldn't have quotations around it
      if (key === "PORT") {
        return `${key} ${val}`;
      }
      if (typeof val === "string") {
        return `${key} '${val}'`;
      }

      if ("secretTextValue" in val) {
        return `${key} '${val.secretTextValue}'`;
      }

      if ("secretName" in val) {
        const secret = attachNamespace(
          val.secretName,
          val.databaseName,
          val.schemaName
        );
        return `${key} SECRET ${secret}`;
      }
      return "";
    })
    .join(",\n");

  return `
CREATE CONNECTION ${name} TO POSTGRES
(
${optionsString}
);`;
};

export async function createPostgresConnection({
  params,
  environment,
  accessToken,
}: {
  params: CreatePostgresConnectionParameters;
  environment: EnabledEnvironment;
  accessToken: string;
}) {
  const createConnectionQuery = createPostgresConnectionStatement(params);

  return createConnection({
    connectionName: params.name,
    schemaName: params.schemaName,
    databaseName: params.databaseName,
    createConnectionQuery,
    environment,
    accessToken,
  });
}

export default createPostgresConnection;
