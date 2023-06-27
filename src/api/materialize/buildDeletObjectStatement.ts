import { sql } from "kysely";

import { queryBuilder } from "~/api/materialize/db";

import { buildFullyQualifiedObjectName } from ".";
import { DatabaseObject } from "./types";

export type DeletableObjectType =
  | "SECRET"
  | "CONNECTION"
  | "SOURCE"
  | "SINK"
  | "CLUSTER"
  | "CLUSTER REPLICA";

export function supportsDropCascase(objectType: DeletableObjectType) {
  return objectType !== "CLUSTER REPLICA";
}

export function deleteObjectQueryBuilder({
  dbObject,
  objectType,
}: {
  dbObject: DatabaseObject;
  objectType: DeletableObjectType;
}) {
  const query = sql`DROP ${sql.raw(objectType)} ${buildFullyQualifiedObjectName(
    dbObject
  )} ${supportsDropCascase(objectType) ? sql.raw("CASCADE") : sql.raw("")}`;
  return query.compile(queryBuilder).sql;
}
