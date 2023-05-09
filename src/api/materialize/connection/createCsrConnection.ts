import { EnabledEnvironment } from "~/recoil/environments";

import { attachNamespace } from "..";
import { buildOptionsString } from "./buildOptionsString";
import createConnection from "./createConnection";
import { Secret, TextSecret } from "./types";

export interface CreateCsrConnectionParameters {
  name: string;
  url: string;
  databaseName: string;
  schemaName: string;
  username?: Secret | TextSecret;
  password?: Secret;
  sslKey?: Secret;
  sslCertificate?: Secret | TextSecret;
  sslCertificateAuthority?: Secret | TextSecret;
}

export const createCsrConnectionStatement = (
  params: CreateCsrConnectionParameters
) => {
  const name = attachNamespace(
    params.name,
    params.databaseName,
    params.schemaName
  );

  const options: [string, string | Secret | TextSecret | undefined][] = [
    ["URL", params.url],
    ["USERNAME", params.username],
    ["PASSWORD", params.password],
    ["SSL KEY", params.sslKey],
    ["SSL CERTIFICATE", params.sslCertificate],
    ["SSL CERTIFICATE AUTHORITY", params.sslCertificateAuthority],
  ];

  const optionsString = buildOptionsString(options);

  return `
CREATE CONNECTION ${name} TO CONFLUENT SCHEMA REGISTRY (
${optionsString}
);`;
};

export function createCsrConnection({
  params,
  environment,
  accessToken,
}: {
  params: CreateCsrConnectionParameters;
  environment: EnabledEnvironment;
  accessToken: string;
}) {
  const createConnectionQuery = createCsrConnectionStatement(params);

  return createConnection({
    connectionName: params.name,
    schemaName: params.schemaName,
    databaseName: params.databaseName,
    createConnectionQuery,
    environment,
    accessToken,
  });
}
