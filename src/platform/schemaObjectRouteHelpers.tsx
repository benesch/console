import React from "react";
import { Navigate } from "react-router-dom";

import { SchemaObject } from "~/api/materialized";

export type ObjectType = "Source" | "Sink";

export type SchemaObjectRouteParams = {
  id: string;
  databaseName: string;
  schemaName: string;
  objectName: string;
};

export const objectPath = (
  regionSlug: string,
  objectType: ObjectType,
  o: SchemaObject
) => {
  return `/${regionSlug}/${objectType}/${relativeObjectPath(o)}`;
};

export const relativeObjectPath = (o: SchemaObject) => {
  return `${o.id}/${o.databaseName}/${o.schemaName}/${o.name}`;
};

export const handleRecreatedObject = <T extends SchemaObject>(
  objects: T[],
  params: Readonly<Partial<SchemaObjectRouteParams>>,
  relativePathFn: RelativePathFn
): ObjectOrRedirectResult<T> => {
  const schemaObject = objects.find(
    (s) =>
      s.databaseName == params.databaseName &&
      s.schemaName === params.schemaName &&
      s.name === params.objectName
  );
  // The schemaObject must have been recreated, since the name matches, but the ID doesn't,
  // so redirect the user to the new path
  if (schemaObject) {
    return {
      type: "redirect",
      redirect: <Navigate to={`../${relativePathFn(schemaObject)}`} replace />,
    };
  } else {
    return {
      type: "redirect",
      redirect: <Navigate to=".." replace />,
    };
  }
};

export const handleRenamedObject = <T extends SchemaObject>(
  schemaObject: T,
  params: Readonly<Partial<SchemaObjectRouteParams>>,
  relativePathFn: RelativePathFn
): ObjectOrRedirectResult<T> => {
  // The schemaObject must have been renamed, redirect the user to the updated path
  if (
    schemaObject.databaseName !== params.databaseName ||
    schemaObject.schemaName !== params.schemaName ||
    schemaObject.name !== params.objectName
  ) {
    return {
      type: "redirect",
      redirect: <Navigate to={`../${relativePathFn(schemaObject)}`} replace />,
    };
  } else {
    return { type: "object", object: schemaObject };
  }
};

export interface RedirectResult {
  type: "redirect";
  redirect: React.ReactElement;
}

export interface ObjectResult<T> {
  type: "object";
  object?: T;
}

export type ObjectOrRedirectResult<T> = RedirectResult | ObjectResult<T>;
export type RelativePathFn = (o: SchemaObject) => string;

export const objectOrRedirect = <T extends SchemaObject>(
  params: Readonly<Partial<SchemaObjectRouteParams>>,
  objects: T[] | null,
  relativePathFn: RelativePathFn
): ObjectOrRedirectResult<T> => {
  // If objects haven't loaded, show the loading state
  if (!objects) {
    return { type: "object" };
  }
  const schemaObject = objects?.find((s) => s.id == params.id);
  if (schemaObject) {
    return handleRenamedObject<T>(schemaObject, params, relativePathFn);
  }
  if (!schemaObject) {
    return handleRecreatedObject<T>(objects, params, relativePathFn);
  }
  return { type: "object", object: schemaObject };
};
