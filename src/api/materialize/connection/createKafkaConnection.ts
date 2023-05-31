import { EnabledEnvironment } from "~/recoil/environments";

import { attachNamespace } from "..";
import createConnection from "./createConnection";
import { Secret, TextSecret } from "./types";

export type Broker = {
  hostPort: string;
};

export type BasicBroker = Broker & {
  type: "basic";
};

export type PrivateLinkBroker = Broker & {
  type: "privateLink";
  privateLink: {
    name: string;
    databaseName: string;
    schemaName: string;
  };
  availabilityZone?: string;
  port?: string;
};

export type SSHTunnelBroker = Broker & {
  type: "sshTunnel";
  sshTunnel: {
    name: string;
    databaseName: string;
    schemaName: string;
  };
};

export type SSLAuth = {
  type: "SSL";
  sslCertificate: Secret | TextSecret;
  sslKey: Secret;
  sslCertificateAuthority?: Secret | TextSecret;
};

export type SASLAuth = {
  type: "SASL";
  saslMechanism: SASLMechanism;
  saslUsername: Secret | TextSecret;
  saslPassword: Secret;
  sslCertificateAuthority?: Secret | TextSecret;
};

export type Auth = SSLAuth | SASLAuth;

export type Brokers = BasicBroker[] | PrivateLinkBroker[] | SSHTunnelBroker[];

export type CreateKafkaConnectionParameters = {
  name: string;
  schemaName: string;
  databaseName: string;
  auth?: Auth;
  brokers: Brokers;
};

export const SASL_MECHANISMS = {
  PLAIN: "Plain",
  "SCRAM-SHA-256": "SCRAM-SHA-256",
  "SCRAM-SHA-512": "SCRAM-SHA-512",
} as const;

export type SASLMechanism = keyof typeof SASL_MECHANISMS;

function createBrokersStatement(brokers: Brokers) {
  if (brokers.length === 1 && brokers[0].type === "basic") {
    return `BROKER '${brokers[0].hostPort}'`;
  }

  const brokersStr = brokers
    .map((broker) => {
      switch (broker.type) {
        case "basic":
          return `'${broker.hostPort}'`;
        case "privateLink": {
          const options = [];
          if (broker.port) {
            options.push(`PORT ${broker.port}`);
          }
          if (broker.availabilityZone) {
            options.push(`AVAILABILITY ZONE '${broker.availabilityZone}'`);
          }
          const optionsStr = options.length ? ` (${options.join(",")})` : "";
          const privateLink = attachNamespace(
            broker.privateLink.name,
            broker.privateLink.databaseName,
            broker.privateLink.schemaName
          );
          return `'${broker.hostPort}' USING AWS PRIVATELINK ${privateLink}${optionsStr}`;
        }
        case "sshTunnel": {
          const sshTunnel = attachNamespace(
            broker.sshTunnel.name,
            broker.sshTunnel.databaseName,
            broker.sshTunnel.schemaName
          );
          return `'${broker.hostPort}' USING SSH TUNNEL ${sshTunnel}`;
        }
      }
    })
    .join(",\n");

  return `BROKERS (
${brokersStr}
)`;
}

function createAuthStatement(auth?: Auth) {
  if (!auth) {
    return "";
  }

  const authOptions =
    auth.type === "SASL"
      ? [
          ["SASL MECHANISMS", auth.saslMechanism],
          ["SASL USERNAME", auth.saslUsername],
          ["SASL PASSWORD", auth.saslPassword],
          ["SSL CERTIFICATE AUTHORITY", auth.sslCertificateAuthority],
        ]
      : [
          ["SSL KEY", auth.sslKey],
          ["SSL CERTIFICATE", auth.sslCertificate],
          ["SSL CERTIFICATE AUTHORITY", auth.sslCertificateAuthority],
        ];

  return authOptions
    .filter(([_, value]) => Boolean(value))
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key} '${value}'`;
      }

      if ("secretTextValue" in value!) {
        return `${key} '${value.secretTextValue}'`;
      }

      if ("secretName" in value!) {
        const secret = attachNamespace(
          value.secretName,
          value.databaseName,
          value.schemaName
        );
        return `${key} SECRET ${secret}`;
      }

      return "";
    })
    .join(",\n");
}

export function createKafkaConnectionStatement(
  params: CreateKafkaConnectionParameters
) {
  const name = attachNamespace(
    params.name,
    params.databaseName,
    params.schemaName
  );
  const authStatement = createAuthStatement(params.auth);
  const brokersStatement = createBrokersStatement(params.brokers);

  const optionsStr = [brokersStatement, authStatement]
    .filter(Boolean)
    .join(",\n");

  return `
CREATE CONNECTION ${name} TO KAFKA (
${optionsStr}
);`;
}

export async function createKafkaConnection({
  params,
  environment,
  accessToken,
}: {
  params: CreateKafkaConnectionParameters;
  environment: EnabledEnvironment;
  accessToken: string;
}) {
  const createConnectionQuery = createKafkaConnectionStatement(params);

  return createConnection({
    connectionName: params.name,
    schemaName: params.schemaName,
    databaseName: params.databaseName,
    createConnectionQuery,
    environment,
    accessToken,
  });
}

export default createKafkaConnection;
