import React from "react";
import { Navigate } from "react-router-dom";

import { SchemaObject } from "~/api/materialized";

export type ObjectType = "Source" | "Sink";

/** Common route params used by any object detail page. */
export type SchemaObjectRouteParams = {
  id: string;
  databaseName: string;
  schemaName: string;
  objectName: string;
};

/** Standard base path of all objects that are tied to a schema. */
export const objectPath = (
  regionSlug: string,
  objectType: ObjectType,
  o: SchemaObject
) => {
  return `/${regionSlug}/${objectType}/${relativeObjectPath(o)}`;
};

/** Standard path fragment of all objects that are tied to a schema. */
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

/**
 * An object representing either a schema object to pass to an object detail page, or a react-router <Navigate /> element to render as a <Routes /> child.
 *
 * @typeParam T The type of the schema object.
 */
export type ObjectOrRedirectResult<T> = RedirectResult | ObjectResult<T>;
export type RelativePathFn = (o: SchemaObject) => string;

/**
 * Determines if a path matches an schema object, or if a redirect is required.
 *
 * If the ID matches, but the name does not, a redirect is returned to update the name.
 * Likewise if the name matches but the ID doesn't, a redirect is returned.
 * If neither ID or name match, a route relative ".." redirect is returned.
 * If both ID and fully qualified name match, the matching object is returned.
 *
 * @returns ObjectOrRedirectResult
 * */
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
