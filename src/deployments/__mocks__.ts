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
  enableTailscale: false,
  materializedExtraArgs: [],
  clusterId: "cluster",
  mzVersion: "1.0.0",
  pendingMigration: null,
  status: "pending",
  cloud_provider: "AWS",
  cloud_provider_region: "us-east-1",
};
