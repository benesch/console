/** Represents the name of a cloud provider. **/
export type CloudProvider = "aws" | "local";

/** Represents a region of a cloud provider in which Materialize operators. */
export interface CloudRegion {
  /** The name of the cloud provider. */
  provider: CloudProvider;
  /** The region of the cloud provider. */
  region: string;
  /** The URL for the controller in that region. */
  regionControllerUrl: string;
}

/** Constructs a short, unique, human-readable identifier for a cloud region.
 *
 * Because cloud regions and environments are 1:1, this function is also usable
 * for constructing the ID for an environment.
 */
export const getRegionId = (region: CloudRegion): string => {
  const providerName =
    region.provider === "aws" ? region.provider.toUpperCase() : region.provider;
  return `${providerName}/${region.region}`;
};

/**
 * Returns an array of the available CloudRegions based on the stack
 *
 * @param stack - String representing the stack: "local", "production" or "$USER.$ENV" for a personal stack
 */
export const buildCloudRegions = (stack: string): CloudRegion[] => {
  if (stack === "local") {
    return [
      {
        provider: "local",
        region: "kind",
        regionControllerUrl: "http://127.0.0.1:8002",
      },
    ];
  }
  const stackString = stack === "production" ? "" : `.${stack}`;
  return [
    {
      provider: "aws",
      region: "us-east-1",
      regionControllerUrl: `https://rc.us-east-1.aws${stackString}.cloud.materialize.com`,
    },
    {
      provider: "aws",
      region: "eu-west-1",
      regionControllerUrl: `https://rc.eu-west-1.aws${stackString}.cloud.materialize.com`,
    },
  ];
};
