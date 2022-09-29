/* Generated by restful-react */

import React from "react";
import { Get, GetProps, useGet, UseGetProps } from "restful-react";
export const SPEC_VERSION = "0.1.0";
export interface Environment {
  environmentdPgwireAddress: string;
  environmentdHttpsAddress: string;
  resolvable?: boolean;
}

export type EnvironmentsListProps = Omit<
  GetProps<Environment[], unknown, void, void>,
  "path"
>;

/**
 * List the available environments
 */
export const EnvironmentsList = (props: EnvironmentsListProps) => (
  <Get<Environment[], unknown, void, void> path="/api/environment" {...props} />
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
  <Get<void, unknown, void, void> path="/api/health" {...props} />
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
