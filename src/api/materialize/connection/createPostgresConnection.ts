import { EnabledEnvironment } from "~/recoil/environments";

import { attachNamespace } from "..";
import { buildOptionsString } from "./buildOptionsString";
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

  const optionsString = buildOptionsString(options);

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
