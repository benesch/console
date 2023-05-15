import { attachNamespace } from ".";

type Secret = {
  isText?: boolean;
  secretValue?: string;
};

export interface CreatePostgresConnectionParameters {
  name: string;
  databaseName: string;
  schemaName: string;
  host: string;
  pgDatabaseName: string;
  user: string;
  port?: string;
  password?: Secret;
  sslMode?: string;
  sslKey?: Secret;
  sslCertificate?: Secret;
  sslCertificateAuthority?: Secret;
}

const createPostgresConnectionStatement = (
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
    .filter(([_, val]) => {
      if (!val) {
        return false;
      }

      if (typeof val === "string") {
        return true;
      }

      return "secretValue" in val && val.secretValue !== undefined;
    })
    .map(([key, val]) => {
      // PORT is an integer and we shouldn't have quotations around it
      if (key === "PORT") {
        return `${key} ${val}`;
      }
      if (typeof val === "string") {
        return `${key} '${val}'`;
      }
      if (val && "secretValue" in val) {
        if (val.isText) {
          return `${key} '${val.secretValue}'`;
        } else {
          return `${key} SECRET ${val.secretValue}`;
        }
      }
      return "";
    })
    .join(",");

  return `
    CREATE CONNECTION ${name} TO POSTGRES
    (
      ${optionsString}
    );
  `;
};

export default createPostgresConnectionStatement;
