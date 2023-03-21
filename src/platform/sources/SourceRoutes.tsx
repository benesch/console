import React from "react";
import { Route, useParams } from "react-router-dom";

import useSources, { Source } from "~/api/materialize/useSources";
import { SchemaObject } from "~/api/materialized";
import SourcesList from "~/platform/sources/SourcesList";
import { SentryRoutes } from "~/sentry";
import useForegroundInterval from "~/useForegroundInterval";

import {
  objectOrRedirect,
  relativeObjectPath,
} from "../schemaObjectRouteHelpers";
import SourceDetail from "./SourceDetail";

const SourceRoutes = () => {
  const { data: sources, loading, refetch } = useSources();
  useForegroundInterval(() => !loading && refetch());

  return (
    <>
      <SentryRoutes>
        <Route path="/" element={<SourcesList sources={sources} />} />
        <Route
          path=":id/:databaseName/:schemaName/:objectName/*"
          element={<SourceOrRedirect sources={sources} />}
        />
      </SentryRoutes>
    </>
  );
};

export const sourceErrorsPath = (regionSlug: string, source: Source) => {
  return `/regions/${regionSlug}/sources/${relativeSourceErrorsPath(source)}`;
};

const relativeSourceErrorsPath = (source: SchemaObject) => {
  return `${relativeObjectPath(source)}/errors`;
};

const SourceOrRedirect: React.FC<{ sources: Source[] | null }> = ({
  sources,
}) => {
  const params = useParams();
  const result = objectOrRedirect(params, sources, relativeSourceErrorsPath);
  if (result.type === "redirect") {
    return result.redirect;
  } else {
    return <SourceDetail source={result.object} />;
  }
};

export default SourceRoutes;
