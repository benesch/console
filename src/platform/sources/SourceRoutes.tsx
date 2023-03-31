import React from "react";
import { Route, useParams } from "react-router-dom";

import useSources, { Source } from "~/api/materialize/useSources";
import { SchemaObject } from "~/api/materialized";
import SourcesList from "~/platform/sources/SourcesList";
import { SentryRoutes } from "~/sentry";
import useForegroundInterval from "~/useForegroundInterval";
import useSchemaObjectFilters from "~/useSchemaObjectFilters";

import {
  objectOrRedirect,
  relativeObjectPath,
} from "../schemaObjectRouteHelpers";
import SourceDetail from "./SourceDetail";

const NAME_FILTER_QUERY_STRING_KEY = "sourceName";

const SourceRoutes = () => {
  const { databaseFilter, schemaFilter, nameFilter } = useSchemaObjectFilters(
    NAME_FILTER_QUERY_STRING_KEY
  );
  const {
    data: sources,
    loading,
    refetch,
  } = useSources({
    databaseId: databaseFilter.selected?.id,
    schemaId: schemaFilter.selected?.id,
    nameFilter: nameFilter.name,
  });
  useForegroundInterval(() => !loading && refetch());

  return (
    <>
      <SentryRoutes>
        <Route
          path="/"
          element={
            <SourcesList
              databaseFilter={databaseFilter}
              schemaFilter={schemaFilter}
              nameFilter={nameFilter}
              sources={sources}
              loading={loading}
            />
          }
        />
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
