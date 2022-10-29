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
