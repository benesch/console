import { EnabledEnvironment } from "~/recoil/environments";

import { attachNamespace } from "..";
import createConnection from "./createConnection";
import { Secret } from "./types";

export interface CreatePostgresConnectionParameters {
  name: string;
  databaseName: string;
  schemaName: string;
  host: string;
  pgDatabaseName: string;
  user: string;
  port?: string;
  password?: Secret | string;
  sslMode?: string;
  sslKey?: Secret | string;
  sslCertificate?: Secret | string;
  sslCertificateAuthority?: Secret | string;
}

export const createPostgresConnectionStatement = (
  params: CreatePostgresConnectionParameters
) => {
  const name = attachNamespace(
    params.name,
    params.databaseName,
    params.schemaName
  );

  const options: [string, string | Secret | undefined][] = [
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
    .filter((option): option is [string, string | Secret] => !!option[1])
    .map(([key, val]) => {
      // PORT is an integer and we shouldn't have quotations around it
      if (key === "PORT") {
        return `${key} ${val}`;
      }
      if (typeof val === "string") {
        return `${key} '${val}'`;
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
