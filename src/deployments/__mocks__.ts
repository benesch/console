import { Deployment, PrometheusMetrics } from "../api/backend";

export const validDeployment: Deployment = {
  id: "1",
  organization: "org-1",
  tlsAuthority: "string",
  name: "eloquent-wombat",
  hostname: "sub.host.com",
  port: 6875,
  flaggedForDeletion: false,
  flaggedForUpdate: true,
  catalogRestoreMode: false,
  size: "S",
  storageMb: 1000,
  disableUserIndexes: false,
  enableTailscale: false,
  materializedExtraArgs: [],
  clusterId: "cluster",
  mzVersion: "1.0.0",
  status: "pending",
  cloudProviderRegion: {
    provider: "AWS",
    region: "us-east-1",
    environmentControllerUrl: "https://localhost:8001",
  },
  releaseTrack: "stable",
};

export const validEUDeployment: Deployment = {
  ...validDeployment,
  id: "2",
  name: "justified-kangaroo",
  size: "XS",
  cloudProviderRegion: {
    provider: "AWS",
    region: "eu-west-1",
    environmentControllerUrl: "https://localhost:8001",
  },
};

export const validEUSecondDeployment: Deployment = {
  ...validEUDeployment,
  id: "3",
  name: "red-ostrich",
};

export const validDeploymentList = [
  validDeployment,
  validEUDeployment,
  validEUSecondDeployment,
];

export const validDeploymentWithTailscale = {
  ...validDeployment,
  enableTailscale: true,
};

export const validPrometheusValues: PrometheusMetrics = {
  metrics: [{ name: "metric", values: [[(+new Date()).toString(), "1"]] }],
};

export const validRegions = (function () {
  const set: Record<string, string[]> = {};
  validDeploymentList.forEach((d) => {
    if (set[d.cloudProviderRegion.provider]) {
      if (
        set[d.cloudProviderRegion.provider].indexOf(
          d.cloudProviderRegion.region
        ) === -1
      ) {
        set[d.cloudProviderRegion.provider].push(d.cloudProviderRegion.region);
      }
    } else {
      set[d.cloudProviderRegion.provider] = [d.cloudProviderRegion.region];
    }
  });
  const result: { provider: string; region: string }[] = [];
  Object.keys(set).forEach((provider) => {
    set[provider].forEach((region) => {
      result.push({
        provider,
        region,
      });
    });
  });
  return result;
})();
