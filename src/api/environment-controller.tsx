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
export interface Environment {
  coordd_address: string;
}

export interface EnvironmentRequest {
  coordd_image_ref: string;
  important?: boolean;
  materializedExtraArgs?: string[];
}

export type EnvironmentsListProps = Omit<
  GetProps<Environment[], unknown, void, void>,
  "path"
>;

/**
 * List the available environments
 */
export const EnvironmentsList = (props: EnvironmentsListProps) => (
  <Get<Environment[], unknown, void, void>
    path={`/api/environment`}
    {...props}
  />
);

export type UseEnvironmentsListProps = Omit<
  UseGetProps<Environment[], unknown, void, void>,
  "path"
>;

/**
 * List the available environments
 */
export const useEnvironmentsList = (props: UseEnvironmentsListProps) =>
  useGet<Environment[], unknown, void, void>(`/api/environment`, props);

export type EnvironmentsCreateProps = Omit<
  MutateProps<Environment, unknown, void, EnvironmentRequest, void>,
  "path" | "verb"
>;

/**
 * Create a new environment.
 */
export const EnvironmentsCreate = (props: EnvironmentsCreateProps) => (
  <Mutate<Environment, unknown, void, EnvironmentRequest, void>
    verb="POST"
    path={`/api/environment`}
    {...props}
  />
);

export type UseEnvironmentsCreateProps = Omit<
  UseMutateProps<Environment, unknown, void, EnvironmentRequest, void>,
  "path" | "verb"
>;

/**
 * Create a new environment.
 */
export const useEnvironmentsCreate = (props: UseEnvironmentsCreateProps) =>
  useMutate<Environment, unknown, void, EnvironmentRequest, void>(
    "POST",
    `/api/environment`,
    props
  );

export type EnvironmentsDestroyProps = Omit<
  MutateProps<void, unknown, void, void, void>,
  "path" | "verb"
>;

/**
 * Destroy an environment.
 */
export const EnvironmentsDestroy = (props: EnvironmentsDestroyProps) => (
  <Mutate<void, unknown, void, void, void>
    verb="DELETE"
    path={`/api/environment`}
    {...props}
  />
);

export type UseEnvironmentsDestroyProps = Omit<
  UseMutateProps<void, unknown, void, void, void>,
  "path" | "verb"
>;

/**
 * Destroy an environment.
 */
export const useEnvironmentsDestroy = (props: UseEnvironmentsDestroyProps) =>
  useMutate<void, unknown, void, void, void>("DELETE", `/api/environment`, {
    ...props,
  });

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
