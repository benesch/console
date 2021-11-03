/* Generated by restful-react */

import React from "react";
import {
  Get,
  GetProps,
  Mutate,
  MutateProps,
  useGet,
  UseGetProps,
  useMutate,
  UseMutateProps,
} from "restful-react";
export const SPEC_VERSION = "0.1.0";
export interface Deployment {
  id: string;
  organization: string;
  tlsAuthority: string;
  name: string;
  hostname: string | null;
  flaggedForDeletion: boolean;
  flaggedForUpdate: boolean;
  size: DeploymentSizeEnum;
  storageMb: number;
  disableUserIndexes: boolean;
  materializedExtraArgs: string[];
  clusterId: string | null;
  mzVersion: string;
  pendingMigration: PendingMigration | null;
  status: string;
  enableTailscale: boolean;
  cloudProviderRegion: SupportedCloudProviderRegion;
}

export interface DeploymentRequest {
  name?: string;
  size?: DeploymentSizeEnum;
  storageMb?: number;
  disableUserIndexes?: boolean;
  materializedExtraArgs?: string[];
  mzVersion?: string;
  enableTailscale?: boolean;
  tailscaleAuthKey?: string;
}

export type DeploymentSizeEnum = "XS" | "S" | "M" | "L" | "XL";

export interface OnboardingCall {
  start: string;
  end: string;
}

export interface Organization {
  id: string;
  /**
   * Whether this organization has been admitted to Materialize Cloud.
   */
  admitted: boolean;
  deploymentLimit: number;
  /**
   * When this organization's trial period expires. If empty, the organization is on an enterprise plan.
   */
  trialExpiresAt: string | null;
}

export interface PatchedDeploymentRequest {
  name?: string;
  size?: DeploymentSizeEnum;
  storageMb?: number;
  disableUserIndexes?: boolean;
  materializedExtraArgs?: string[];
  mzVersion?: string;
  enableTailscale?: boolean;
  tailscaleAuthKey?: string;
}

export interface PendingMigration {
  description: string;
  deadline: string;
}

export interface PendingMigrationRequest {
  description: string;
  deadline: string;
}

export type ProviderEnum = "AWS" | "GCP" | "AZURE";

export type RegionEnum = "us-east-1" | "eu-west-1" | "us-east1";

export interface SupportedCloudProviderRegion {
  provider: ProviderEnum;
  region: RegionEnum;
}

export interface SupportedCloudProviderRegionRequest {
  provider?: ProviderEnum;
  region?: RegionEnum;
}

export type DeploymentsListProps = Omit<
  GetProps<Deployment[], unknown, void, void>,
  "path"
>;

/**
 * List the available deployments.
 */
export const DeploymentsList = (props: DeploymentsListProps) => (
  <Get<Deployment[], unknown, void, void>
    path={`/api/deployments`}
    {...props}
  />
);

export type UseDeploymentsListProps = Omit<
  UseGetProps<Deployment[], unknown, void, void>,
  "path"
>;

/**
 * List the available deployments.
 */
export const useDeploymentsList = (props: UseDeploymentsListProps) =>
  useGet<Deployment[], unknown, void, void>(`/api/deployments`, props);

export type DeploymentsCreateProps = Omit<
  MutateProps<Deployment, unknown, void, DeploymentRequest, void>,
  "path" | "verb"
>;

/**
 * Create a new deployment.
 */
export const DeploymentsCreate = (props: DeploymentsCreateProps) => (
  <Mutate<Deployment, unknown, void, DeploymentRequest, void>
    verb="POST"
    path={`/api/deployments`}
    {...props}
  />
);

export type UseDeploymentsCreateProps = Omit<
  UseMutateProps<Deployment, unknown, void, DeploymentRequest, void>,
  "path" | "verb"
>;

/**
 * Create a new deployment.
 */
export const useDeploymentsCreate = (props: UseDeploymentsCreateProps) =>
  useMutate<Deployment, unknown, void, DeploymentRequest, void>(
    "POST",
    `/api/deployments`,
    props
  );

export interface DeploymentsRetrieveQueryParams {
  cloud_provider?: string;
  cloud_provider_region?: string;
}

export interface DeploymentsRetrievePathParams {
  id: string;
}

export type DeploymentsRetrieveProps = Omit<
  GetProps<
    Deployment,
    unknown,
    DeploymentsRetrieveQueryParams,
    DeploymentsRetrievePathParams
  >,
  "path"
> &
  DeploymentsRetrievePathParams;

/**
 * Fetch details about a single deployment.
 */
export const DeploymentsRetrieve = ({
  id,
  ...props
}: DeploymentsRetrieveProps) => (
  <Get<
    Deployment,
    unknown,
    DeploymentsRetrieveQueryParams,
    DeploymentsRetrievePathParams
  >
    path={`/api/deployments/${id}`}
    {...props}
  />
);

export type UseDeploymentsRetrieveProps = Omit<
  UseGetProps<
    Deployment,
    unknown,
    DeploymentsRetrieveQueryParams,
    DeploymentsRetrievePathParams
  >,
  "path"
> &
  DeploymentsRetrievePathParams;

/**
 * Fetch details about a single deployment.
 */
export const useDeploymentsRetrieve = ({
  id,
  ...props
}: UseDeploymentsRetrieveProps) =>
  useGet<
    Deployment,
    unknown,
    DeploymentsRetrieveQueryParams,
    DeploymentsRetrievePathParams
  >(
    (paramsInPath: DeploymentsRetrievePathParams) =>
      `/api/deployments/${paramsInPath.id}`,
    { pathParams: { id }, ...props }
  );

export interface DeploymentsUpdateQueryParams {
  cloud_provider?: string;
  cloud_provider_region?: string;
}

export interface DeploymentsUpdatePathParams {
  id: string;
}

export type DeploymentsUpdateProps = Omit<
  MutateProps<
    Deployment,
    unknown,
    DeploymentsUpdateQueryParams,
    DeploymentRequest,
    DeploymentsUpdatePathParams
  >,
  "path" | "verb"
> &
  DeploymentsUpdatePathParams;

/**
 * Update a deployment.
 */
export const DeploymentsUpdate = ({ id, ...props }: DeploymentsUpdateProps) => (
  <Mutate<
    Deployment,
    unknown,
    DeploymentsUpdateQueryParams,
    DeploymentRequest,
    DeploymentsUpdatePathParams
  >
    verb="PUT"
    path={`/api/deployments/${id}`}
    {...props}
  />
);

export type UseDeploymentsUpdateProps = Omit<
  UseMutateProps<
    Deployment,
    unknown,
    DeploymentsUpdateQueryParams,
    DeploymentRequest,
    DeploymentsUpdatePathParams
  >,
  "path" | "verb"
> &
  DeploymentsUpdatePathParams;

/**
 * Update a deployment.
 */
export const useDeploymentsUpdate = ({
  id,
  ...props
}: UseDeploymentsUpdateProps) =>
  useMutate<
    Deployment,
    unknown,
    DeploymentsUpdateQueryParams,
    DeploymentRequest,
    DeploymentsUpdatePathParams
  >(
    "PUT",
    (paramsInPath: DeploymentsUpdatePathParams) =>
      `/api/deployments/${paramsInPath.id}`,
    { pathParams: { id }, ...props }
  );

export interface DeploymentsPartialUpdateQueryParams {
  cloud_provider?: string;
  cloud_provider_region?: string;
}

export interface DeploymentsPartialUpdatePathParams {
  id: string;
}

export type DeploymentsPartialUpdateProps = Omit<
  MutateProps<
    Deployment,
    unknown,
    DeploymentsPartialUpdateQueryParams,
    PatchedDeploymentRequest,
    DeploymentsPartialUpdatePathParams
  >,
  "path" | "verb"
> &
  DeploymentsPartialUpdatePathParams;

/**
 * Partially update a deployment.
 */
export const DeploymentsPartialUpdate = ({
  id,
  ...props
}: DeploymentsPartialUpdateProps) => (
  <Mutate<
    Deployment,
    unknown,
    DeploymentsPartialUpdateQueryParams,
    PatchedDeploymentRequest,
    DeploymentsPartialUpdatePathParams
  >
    verb="PATCH"
    path={`/api/deployments/${id}`}
    {...props}
  />
);

export type UseDeploymentsPartialUpdateProps = Omit<
  UseMutateProps<
    Deployment,
    unknown,
    DeploymentsPartialUpdateQueryParams,
    PatchedDeploymentRequest,
    DeploymentsPartialUpdatePathParams
  >,
  "path" | "verb"
> &
  DeploymentsPartialUpdatePathParams;

/**
 * Partially update a deployment.
 */
export const useDeploymentsPartialUpdate = ({
  id,
  ...props
}: UseDeploymentsPartialUpdateProps) =>
  useMutate<
    Deployment,
    unknown,
    DeploymentsPartialUpdateQueryParams,
    PatchedDeploymentRequest,
    DeploymentsPartialUpdatePathParams
  >(
    "PATCH",
    (paramsInPath: DeploymentsPartialUpdatePathParams) =>
      `/api/deployments/${paramsInPath.id}`,
    { pathParams: { id }, ...props }
  );

export interface DeploymentsDestroyQueryParams {
  cloud_provider?: string;
  cloud_provider_region?: string;
}

export type DeploymentsDestroyProps = Omit<
  MutateProps<void, unknown, DeploymentsDestroyQueryParams, string, void>,
  "path" | "verb"
>;

/**
 * Destroy a deployment.
 */
export const DeploymentsDestroy = (props: DeploymentsDestroyProps) => (
  <Mutate<void, unknown, DeploymentsDestroyQueryParams, string, void>
    verb="DELETE"
    path={`/api/deployments`}
    {...props}
  />
);

export type UseDeploymentsDestroyProps = Omit<
  UseMutateProps<void, unknown, DeploymentsDestroyQueryParams, string, void>,
  "path" | "verb"
>;

/**
 * Destroy a deployment.
 */
export const useDeploymentsDestroy = (props: UseDeploymentsDestroyProps) =>
  useMutate<void, unknown, DeploymentsDestroyQueryParams, string, void>(
    "DELETE",
    `/api/deployments`,
    { ...props }
  );

export interface DeploymentsCertsRetrieveQueryParams {
  cloud_provider?: string;
  cloud_provider_region?: string;
}

export interface DeploymentsCertsRetrievePathParams {
  id: string;
}

export type DeploymentsCertsRetrieveProps = Omit<
  GetProps<
    string,
    unknown,
    DeploymentsCertsRetrieveQueryParams,
    DeploymentsCertsRetrievePathParams
  >,
  "path"
> &
  DeploymentsCertsRetrievePathParams;

/**
 * Retrieve a TLS certificate bundle for a deployment.
 *
 * The TLS certificate bundle is a ZIP file containing PEM and DER
 * formatted keys that permit authenticating to the deployment as the
 * `materialize` user.
 */
export const DeploymentsCertsRetrieve = ({
  id,
  ...props
}: DeploymentsCertsRetrieveProps) => (
  <Get<
    string,
    unknown,
    DeploymentsCertsRetrieveQueryParams,
    DeploymentsCertsRetrievePathParams
  >
    path={`/api/deployments/${id}/certs`}
    {...props}
  />
);

export type UseDeploymentsCertsRetrieveProps = Omit<
  UseGetProps<
    string,
    unknown,
    DeploymentsCertsRetrieveQueryParams,
    DeploymentsCertsRetrievePathParams
  >,
  "path"
> &
  DeploymentsCertsRetrievePathParams;

/**
 * Retrieve a TLS certificate bundle for a deployment.
 *
 * The TLS certificate bundle is a ZIP file containing PEM and DER
 * formatted keys that permit authenticating to the deployment as the
 * `materialize` user.
 */
export const useDeploymentsCertsRetrieve = ({
  id,
  ...props
}: UseDeploymentsCertsRetrieveProps) =>
  useGet<
    string,
    unknown,
    DeploymentsCertsRetrieveQueryParams,
    DeploymentsCertsRetrievePathParams
  >(
    (paramsInPath: DeploymentsCertsRetrievePathParams) =>
      `/api/deployments/${paramsInPath.id}/certs`,
    { pathParams: { id }, ...props }
  );

export interface DeploymentsLogsRetrieveQueryParams {
  cloud_provider?: string;
  cloud_provider_region?: string;
  previous?: boolean;
}

export interface DeploymentsLogsRetrievePathParams {
  id: string;
}

export type DeploymentsLogsRetrieveProps = Omit<
  GetProps<
    string,
    unknown,
    DeploymentsLogsRetrieveQueryParams,
    DeploymentsLogsRetrievePathParams
  >,
  "path"
> &
  DeploymentsLogsRetrievePathParams;

/**
 * Retrieve the logs for a deployment.
 */
export const DeploymentsLogsRetrieve = ({
  id,
  ...props
}: DeploymentsLogsRetrieveProps) => (
  <Get<
    string,
    unknown,
    DeploymentsLogsRetrieveQueryParams,
    DeploymentsLogsRetrievePathParams
  >
    path={`/api/deployments/${id}/logs`}
    {...props}
  />
);

export type UseDeploymentsLogsRetrieveProps = Omit<
  UseGetProps<
    string,
    unknown,
    DeploymentsLogsRetrieveQueryParams,
    DeploymentsLogsRetrievePathParams
  >,
  "path"
> &
  DeploymentsLogsRetrievePathParams;

/**
 * Retrieve the logs for a deployment.
 */
export const useDeploymentsLogsRetrieve = ({
  id,
  ...props
}: UseDeploymentsLogsRetrieveProps) =>
  useGet<
    string,
    unknown,
    DeploymentsLogsRetrieveQueryParams,
    DeploymentsLogsRetrievePathParams
  >(
    (paramsInPath: DeploymentsLogsRetrievePathParams) =>
      `/api/deployments/${paramsInPath.id}/logs`,
    { pathParams: { id }, ...props }
  );

export interface DeploymentsTailscaleLogsRetrieveQueryParams {
  cloud_provider?: string;
  cloud_provider_region?: string;
  previous?: boolean;
}

export interface DeploymentsTailscaleLogsRetrievePathParams {
  id: string;
}

export type DeploymentsTailscaleLogsRetrieveProps = Omit<
  GetProps<
    string,
    unknown,
    DeploymentsTailscaleLogsRetrieveQueryParams,
    DeploymentsTailscaleLogsRetrievePathParams
  >,
  "path"
> &
  DeploymentsTailscaleLogsRetrievePathParams;

/**
 * Retrieve the logs for a Tailscale container.
 */
export const DeploymentsTailscaleLogsRetrieve = ({
  id,
  ...props
}: DeploymentsTailscaleLogsRetrieveProps) => (
  <Get<
    string,
    unknown,
    DeploymentsTailscaleLogsRetrieveQueryParams,
    DeploymentsTailscaleLogsRetrievePathParams
  >
    path={`/api/deployments/${id}/tailscale_logs`}
    {...props}
  />
);

export type UseDeploymentsTailscaleLogsRetrieveProps = Omit<
  UseGetProps<
    string,
    unknown,
    DeploymentsTailscaleLogsRetrieveQueryParams,
    DeploymentsTailscaleLogsRetrievePathParams
  >,
  "path"
> &
  DeploymentsTailscaleLogsRetrievePathParams;

/**
 * Retrieve the logs for a Tailscale container.
 */
export const useDeploymentsTailscaleLogsRetrieve = ({
  id,
  ...props
}: UseDeploymentsTailscaleLogsRetrieveProps) =>
  useGet<
    string,
    unknown,
    DeploymentsTailscaleLogsRetrieveQueryParams,
    DeploymentsTailscaleLogsRetrievePathParams
  >(
    (paramsInPath: DeploymentsTailscaleLogsRetrievePathParams) =>
      `/api/deployments/${paramsInPath.id}/tailscale_logs`,
    { pathParams: { id }, ...props }
  );

export type HealthRetrieveProps = Omit<
  GetProps<void, unknown, void, void>,
  "path"
>;

/**
 * Basic health check endpoint.
 *
 * This endpoint always returns 200 OK. It is intended for use by load
 * balancers and such that need a basic indication as to whether the server is
 * live.
 */
export const HealthRetrieve = (props: HealthRetrieveProps) => (
  <Get<void, unknown, void, void> path={`/api/health`} {...props} />
);

export type UseHealthRetrieveProps = Omit<
  UseGetProps<void, unknown, void, void>,
  "path"
>;

/**
 * Basic health check endpoint.
 *
 * This endpoint always returns 200 OK. It is intended for use by load
 * balancers and such that need a basic indication as to whether the server is
 * live.
 */
export const useHealthRetrieve = (props: UseHealthRetrieveProps) =>
  useGet<void, unknown, void, void>(`/api/health`, props);

export type MzVersionsListProps = Omit<
  GetProps<string[], unknown, void, void>,
  "path"
>;

/**
 * List the versions of Materialize known to Materialize Cloud.
 *
 * Versions are listed in order from oldest to newest.
 */
export const MzVersionsList = (props: MzVersionsListProps) => (
  <Get<string[], unknown, void, void> path={`/api/mz-versions`} {...props} />
);

export type UseMzVersionsListProps = Omit<
  UseGetProps<string[], unknown, void, void>,
  "path"
>;

/**
 * List the versions of Materialize known to Materialize Cloud.
 *
 * Versions are listed in order from oldest to newest.
 */
export const useMzVersionsList = (props: UseMzVersionsListProps) =>
  useGet<string[], unknown, void, void>(`/api/mz-versions`, props);

export interface MzVersionsLatestRetrieveQueryParams {
  track?: string;
}

export type MzVersionsLatestRetrieveProps = Omit<
  GetProps<string, unknown, MzVersionsLatestRetrieveQueryParams, void>,
  "path"
>;

/**
 * Returns the latest version of Materialize.
 */
export const MzVersionsLatestRetrieve = (
  props: MzVersionsLatestRetrieveProps
) => (
  <Get<string, unknown, MzVersionsLatestRetrieveQueryParams, void>
    path={`/api/mz-versions/latest`}
    {...props}
  />
);

export type UseMzVersionsLatestRetrieveProps = Omit<
  UseGetProps<string, unknown, MzVersionsLatestRetrieveQueryParams, void>,
  "path"
>;

/**
 * Returns the latest version of Materialize.
 */
export const useMzVersionsLatestRetrieve = (
  props: UseMzVersionsLatestRetrieveProps
) =>
  useGet<string, unknown, MzVersionsLatestRetrieveQueryParams, void>(
    `/api/mz-versions/latest`,
    props
  );

export type OnboardingCallRetrieveProps = Omit<
  GetProps<OnboardingCall, unknown, void, void>,
  "path"
>;

/**
 * Retrieve the first scheduled onboarding call for a user.
 */
export const OnboardingCallRetrieve = (props: OnboardingCallRetrieveProps) => (
  <Get<OnboardingCall, unknown, void, void>
    path={`/api/onboarding-call`}
    {...props}
  />
);

export type UseOnboardingCallRetrieveProps = Omit<
  UseGetProps<OnboardingCall, unknown, void, void>,
  "path"
>;

/**
 * Retrieve the first scheduled onboarding call for a user.
 */
export const useOnboardingCallRetrieve = (
  props: UseOnboardingCallRetrieveProps
) => useGet<OnboardingCall, unknown, void, void>(`/api/onboarding-call`, props);

export interface OrganizationsRetrievePathParams {
  /**
   * A UUID string identifying this organization.
   */
  id: string;
}

export type OrganizationsRetrieveProps = Omit<
  GetProps<Organization, unknown, void, OrganizationsRetrievePathParams>,
  "path"
> &
  OrganizationsRetrievePathParams;

/**
 * Fetch details about a single organization.
 */
export const OrganizationsRetrieve = ({
  id,
  ...props
}: OrganizationsRetrieveProps) => (
  <Get<Organization, unknown, void, OrganizationsRetrievePathParams>
    path={`/api/organizations/${id}`}
    {...props}
  />
);

export type UseOrganizationsRetrieveProps = Omit<
  UseGetProps<Organization, unknown, void, OrganizationsRetrievePathParams>,
  "path"
> &
  OrganizationsRetrievePathParams;

/**
 * Fetch details about a single organization.
 */
export const useOrganizationsRetrieve = ({
  id,
  ...props
}: UseOrganizationsRetrieveProps) =>
  useGet<Organization, unknown, void, OrganizationsRetrievePathParams>(
    (paramsInPath: OrganizationsRetrievePathParams) =>
      `/api/organizations/${paramsInPath.id}`,
    { pathParams: { id }, ...props }
  );

export interface SchemaRetrieveResponse {
  [key: string]: any;
}

export interface SchemaRetrieveQueryParams {
  format?: "json" | "yaml";
}

export type SchemaRetrieveProps = Omit<
  GetProps<SchemaRetrieveResponse, unknown, SchemaRetrieveQueryParams, void>,
  "path"
>;

/**
 * OpenApi3 schema for this API. Format can be selected via content negotiation.
 *
 * - YAML: application/vnd.oai.openapi
 * - JSON: application/vnd.oai.openapi+json
 */
export const SchemaRetrieve = (props: SchemaRetrieveProps) => (
  <Get<SchemaRetrieveResponse, unknown, SchemaRetrieveQueryParams, void>
    path={`/api/schema`}
    {...props}
  />
);

export type UseSchemaRetrieveProps = Omit<
  UseGetProps<SchemaRetrieveResponse, unknown, SchemaRetrieveQueryParams, void>,
  "path"
>;

/**
 * OpenApi3 schema for this API. Format can be selected via content negotiation.
 *
 * - YAML: application/vnd.oai.openapi
 * - JSON: application/vnd.oai.openapi+json
 */
export const useSchemaRetrieve = (props: UseSchemaRetrieveProps) =>
  useGet<SchemaRetrieveResponse, unknown, SchemaRetrieveQueryParams, void>(
    `/api/schema`,
    props
  );
