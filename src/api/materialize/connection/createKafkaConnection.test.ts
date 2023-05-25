import { createKafkaConnectionStatement } from "./createKafkaConnection";

describe("createKafkaConnectionStatement", () => {
  it("single broker", () => {
    const statement = createKafkaConnectionStatement({
      name: "kafka_connection",
      databaseName: "materialize",
      schemaName: "public",
      brokers: [{ type: "basic", hostPort: "broker1:9092" }],
    });
    expect(statement).toEqual(`
CREATE CONNECTION "materialize"."public"."kafka_connection" TO KAFKA (
BROKER 'broker1:9092'
);`);
  });

  it("multiple brokers", () => {
    const statement = createKafkaConnectionStatement({
      name: "kafka_connection",
      databaseName: "materialize",
      schemaName: "public",
      brokers: [
        { type: "basic", hostPort: "broker1:9092" },
        { type: "basic", hostPort: "broker2:9092" },
      ],
    });
    expect(statement).toEqual(`
CREATE CONNECTION "materialize"."public"."kafka_connection" TO KAFKA (
BROKERS (
'broker1:9092',
'broker2:9092'
)
);`);
  });

  it("SASL authentication", () => {
    const statement = createKafkaConnectionStatement({
      name: "kafka_connection",
      databaseName: "materialize",
      schemaName: "public",
      brokers: [{ type: "basic", hostPort: "broker1:9092" }],
      auth: {
        type: "SASL",
        saslMechanism: "PLAIN",
        saslUsername: { secretTextValue: "user" },
        saslPassword: {
          secretName: "kafka_password",
          databaseName: "materialize",
          schemaName: "public",
        },
        sslCertificateAuthority: { secretTextValue: "MIICzjCCAbeg..." },
      },
    });
    expect(statement).toEqual(`
CREATE CONNECTION "materialize"."public"."kafka_connection" TO KAFKA (
BROKER 'broker1:9092',
SASL MECHANISMS 'PLAIN',
SASL USERNAME 'user',
SASL PASSWORD SECRET "materialize"."public"."kafka_password",
SSL CERTIFICATE AUTHORITY 'MIICzjCCAbeg...'
);`);
  });

  it("SSL authentication", () => {
    const statement = createKafkaConnectionStatement({
      name: "kafka_connection",
      databaseName: "materialize",
      schemaName: "public",
      brokers: [{ type: "basic", hostPort: "broker1:9092" }],
      auth: {
        type: "SSL",
        sslKey: {
          secretName: "kafka_ssl_key",
          databaseName: "materialize",
          schemaName: "public",
        },
        sslCertificate: { secretTextValue: "MIICzjCCAbeg..." },
        sslCertificateAuthority: { secretTextValue: "MIICzjCCAbeg..." },
      },
    });
    expect(statement).toEqual(`
CREATE CONNECTION "materialize"."public"."kafka_connection" TO KAFKA (
BROKER 'broker1:9092',
SSL KEY SECRET "materialize"."public"."kafka_ssl_key",
SSL CERTIFICATE 'MIICzjCCAbeg...',
SSL CERTIFICATE AUTHORITY 'MIICzjCCAbeg...'
);`);
  });

  it("private link connection", () => {
    const statement = createKafkaConnectionStatement({
      name: "kafka_connection",
      databaseName: "materialize",
      schemaName: "public",
      brokers: [
        {
          type: "privateLink",
          hostPort: "broker1:9092",
          privateLink: {
            name: "privatelink_svc",
            databaseName: "materialize",
            schemaName: "public",
          },
        },
        {
          type: "privateLink",
          hostPort: "broker2:9092",
          privateLink: {
            name: "privatelink_svc",
            databaseName: "materialize",
            schemaName: "public",
          },
          port: "9093",
        },
        {
          type: "privateLink",
          hostPort: "broker2:9092",
          privateLink: {
            name: "privatelink_svc",
            databaseName: "materialize",
            schemaName: "public",
          },
          port: "9093",
          availabilityZone: "use1-az1",
        },
      ],
    });
    expect(statement).toEqual(`
CREATE CONNECTION "materialize"."public"."kafka_connection" TO KAFKA (
BROKERS (
'broker1:9092' USING AWS PRIVATELINK "materialize"."public"."privatelink_svc",
'broker2:9092' USING AWS PRIVATELINK "materialize"."public"."privatelink_svc" (PORT 9093),
'broker2:9092' USING AWS PRIVATELINK "materialize"."public"."privatelink_svc" (PORT 9093,AVAILABILITY ZONE 'use1-az1')
)
);`);
  });
  it("ssh tunnel connection", () => {
    const statement = createKafkaConnectionStatement({
      name: "kafka_connection",
      databaseName: "materialize",
      schemaName: "public",
      brokers: [
        {
          type: "sshTunnel",
          hostPort: "broker1:9092",
          sshTunnel: {
            name: "ssh_connection",
            databaseName: "materialize",
            schemaName: "public",
          },
        },
      ],
    });
    expect(statement).toEqual(`
CREATE CONNECTION "materialize"."public"."kafka_connection" TO KAFKA (
BROKERS (
'broker1:9092' USING SSH TUNNEL "materialize"."public"."ssh_connection"
)
);`);
  });
});
