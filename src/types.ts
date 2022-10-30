/** Global configuration parameters. */

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
export const getRegionId = (region: CloudRegion): string =>
  `${region.provider}/${region.region}`;

declare global {
  const __FRONTEGG_URL__: string;
  const __SEGMENT_API_KEY__: string | null;
  const __SENTRY_DSN__: string | null;
  const __SENTRY_ENVIRONMENT__: string | null;
  const __SENTRY_RELEASE__: string | null;
  const __GOOGLE_ANALYTICS_ID__: string | null;
  const __STATUSPAGE_ID__: string;
  const __ENVIRONMENTD_SCHEME__: "http" | "https";
  const __CLOUD_REGIONS__: CloudRegion[];
}
