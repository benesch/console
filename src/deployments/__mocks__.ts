import { Deployment } from "../api/api";

export const validDeployment: Deployment = {
  id: "1",
  organization: "org-1",
  tlsAuthority: "string",
  name: "eloquent-wombat",
  hostname: "sub.host.com",
  flaggedForDeletion: false,
  flaggedForUpdate: true,
  size: "S",
  storageMb: 1000,
  disableUserIndexes: false,
  materializedExtraArgs: [],
  clusterId: "cluster",
  mzVersion: "1.0.0",
  pendingMigration: null,
  status: "pending",
};

export const prometheusData = {
  status: "success",
  data: {
    resultType: "matrix",
    result: [
      {
        metric: {
          __name__: "up",
          job: "prometheus",
          instance: "localhost:9090",
        },
        values: [
          [1435781430.781, "1"],
          [1435781445.781, "1"],
          [1435781460.781, "1"],
        ],
      },
      {
        metric: {
          __name__: "up",
          job: "node",
          instance: "localhost:9091",
        },
        values: [
          [1435781430.781, "0"],
          [1435781445.781, "0"],
          [1435781460.781, "1"],
        ],
      },
    ],
  },
};
