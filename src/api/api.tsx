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
  cloudProviderRegion: SupportedCloudRegion;
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
  cloudProviderRegion: SupportedCloudRegionRequest;
}

export type DeploymentSizeEnum = "XS" | "S" | "M" | "L" | "XL";

export interface DeploymentUpdateRequest {
  name?: string;
  size?: DeploymentSizeEnum;
  storageMb?: number;
  disableUserIndexes?: boolean;
  materializedExtraArgs?: string[];
  mzVersion?: string;
  enableTailscale?: boolean;
  tailscaleAuthKey?: string;
}

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

export interface PatchedDeploymentUpdateRequest {
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

export type ProviderEnum = "AWS";

export interface SupportedCloudRegion {
  provider: ProviderEnum;
  region: string;
}

export interface SupportedCloudRegionRequest {
  provider: ProviderEnum;
  region: string;
}

export type CloudProvidersRetrieveProps = Omit<
  GetProps<SupportedCloudRegion, unknown, void, void>,
  "path"
>;

/**
 * List the cloud provider and regions
 */
export const CloudProvidersRetrieve = (props: CloudProvidersRetrieveProps) => (
  <Get<SupportedCloudRegion, unknown, void, void>
    path={`/api/cloud-providers`}
    {...props}
  />
);

export type UseCloudProvidersRetrieveProps = Omit<
  UseGetProps<SupportedCloudRegion, unknown, void, void>,
  "path"
>;

/**
 * List the cloud provider and regions
 */
export const useCloudProvidersRetrieve = (
  props: UseCloudProvidersRetrieveProps
) =>
  useGet<SupportedCloudRegion, unknown, void, void>(
    `/api/cloud-providers`,
    props
  );

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

export interface DeploymentsRetrievePathParams {
  id: string;
}

export type DeploymentsRetrieveProps = Omit<
  GetProps<Deployment, unknown, void, DeploymentsRetrievePathParams>,
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
  <Get<Deployment, unknown, void, DeploymentsRetrievePathParams>
    path={`/api/deployments/${id}`}
    {...props}
  />
);

export type UseDeploymentsRetrieveProps = Omit<
  UseGetProps<Deployment, unknown, void, DeploymentsRetrievePathParams>,
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
  useGet<Deployment, unknown, void, DeploymentsRetrievePathParams>(
    (paramsInPath: DeploymentsRetrievePathParams) =>
      `/api/deployments/${paramsInPath.id}`,
    { pathParams: { id }, ...props }
  );

export interface DeploymentsUpdatePathParams {
  id: string;
}

export type DeploymentsUpdateProps = Omit<
  MutateProps<
    Deployment,
    unknown,
    void,
    DeploymentUpdateRequest,
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
    void,
    DeploymentUpdateRequest,
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
    void,
    DeploymentUpdateRequest,
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
    void,
    DeploymentUpdateRequest,
    DeploymentsUpdatePathParams
  >(
    "PUT",
    (paramsInPath: DeploymentsUpdatePathParams) =>
      `/api/deployments/${paramsInPath.id}`,
    { pathParams: { id }, ...props }
  );

export interface DeploymentsPartialUpdatePathParams {
  id: string;
}

export type DeploymentsPartialUpdateProps = Omit<
  MutateProps<
    Deployment,
    unknown,
    void,
    PatchedDeploymentUpdateRequest,
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
    void,
    PatchedDeploymentUpdateRequest,
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
    void,
    PatchedDeploymentUpdateRequest,
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
    void,
    PatchedDeploymentUpdateRequest,
    DeploymentsPartialUpdatePathParams
  >(
    "PATCH",
    (paramsInPath: DeploymentsPartialUpdatePathParams) =>
      `/api/deployments/${paramsInPath.id}`,
    { pathParams: { id }, ...props }
  );

export type DeploymentsDestroyProps = Omit<
  MutateProps<void, unknown, void, string, void>,
  "path" | "verb"
>;

/**
 * Destroy a deployment.
 */
export const DeploymentsDestroy = (props: DeploymentsDestroyProps) => (
  <Mutate<void, unknown, void, string, void>
    verb="DELETE"
    path={`/api/deployments`}
    {...props}
  />
);

export type UseDeploymentsDestroyProps = Omit<
  UseMutateProps<void, unknown, void, string, void>,
  "path" | "verb"
>;

/**
 * Destroy a deployment.
 */
export const useDeploymentsDestroy = (props: UseDeploymentsDestroyProps) =>
  useMutate<void, unknown, void, string, void>("DELETE", `/api/deployments`, {
    ...props,
  });

export interface DeploymentsCertsRetrievePathParams {
  id: string;
}

export type DeploymentsCertsRetrieveProps = Omit<
  GetProps<string, unknown, void, DeploymentsCertsRetrievePathParams>,
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
  <Get<string, unknown, void, DeploymentsCertsRetrievePathParams>
    path={`/api/deployments/${id}/certs`}
    {...props}
  />
);

export type UseDeploymentsCertsRetrieveProps = Omit<
  UseGetProps<string, unknown, void, DeploymentsCertsRetrievePathParams>,
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
  useGet<string, unknown, void, DeploymentsCertsRetrievePathParams>(
    (paramsInPath: DeploymentsCertsRetrievePathParams) =>
      `/api/deployments/${paramsInPath.id}/certs`,
    { pathParams: { id }, ...props }
  );

export interface DeploymentsLogsRetrieveQueryParams {
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

export interface RegionsRetrievePathParams {
  providerName: string;
}

export type RegionsRetrieveProps = Omit<
  GetProps<SupportedCloudRegion, unknown, void, RegionsRetrievePathParams>,
  "path"
> &
  RegionsRetrievePathParams;

export const RegionsRetrieve = ({
  providerName,
  ...props
}: RegionsRetrieveProps) => (
  <Get<SupportedCloudRegion, unknown, void, RegionsRetrievePathParams>
    path={`/api/regions/${providerName}`}
    {...props}
  />
);

export type UseRegionsRetrieveProps = Omit<
  UseGetProps<SupportedCloudRegion, unknown, void, RegionsRetrievePathParams>,
  "path"
> &
  RegionsRetrievePathParams;

export const useRegionsRetrieve = ({
  providerName,
  ...props
}: UseRegionsRetrieveProps) =>
  useGet<SupportedCloudRegion, unknown, void, RegionsRetrievePathParams>(
    (paramsInPath: RegionsRetrievePathParams) =>
      `/api/regions/${paramsInPath.providerName}`,
    { pathParams: { providerName }, ...props }
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
