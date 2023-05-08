import React from "react";
import { Route, useParams } from "react-router-dom";

import useSources, {
  Source,
  SourcesResponse,
} from "~/api/materialize/useSources";
import { SchemaObject } from "~/api/materialized";
import SourcesList from "~/platform/sources/SourcesList";
import { SentryRoutes } from "~/sentry";
import { usePoll } from "~/useForegroundInterval";
import useSchemaObjectFilters from "~/useSchemaObjectFilters";

import {
  objectOrRedirect,
  relativeObjectPath,
} from "../schemaObjectRouteHelpers";
import CreateSourceEntry from "./create/CreateSourceEntry";
import NewPostgresSource from "./create/NewPostgresSource";
import SourceDetail from "./SourceDetail";

const NAME_FILTER_QUERY_STRING_KEY = "sourceName";

const SourceRoutes = () => {
  return (
    <SentryRoutes>
      <Route path="/new/*" element={<NewSourceRoutes />} />
      <Route path="/*" element={<ShowSourceRoutes />} />
    </SentryRoutes>
  );
};

const ShowSourceRoutes = () => {
  const { databaseFilter, schemaFilter, nameFilter } = useSchemaObjectFilters(
    NAME_FILTER_QUERY_STRING_KEY
  );

  const sourcesResponse = useSources({
    databaseId: databaseFilter.selected?.id,
    schemaId: schemaFilter.selected?.id,
    nameFilter: nameFilter.name,
  });

  const { refetch, loading } = sourcesResponse;

  const isPolling = usePoll(loading, refetch);

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
              sourcesResponse={sourcesResponse}
              isPolling={isPolling}
            />
          }
        />
        <Route
          path=":id/:databaseName/:schemaName/:objectName/*"
          element={<SourceOrRedirect sourcesResponse={sourcesResponse} />}
        />
      </SentryRoutes>
    </>
  );
};

const NewSourceRoutes = () => {
  return (
    <SentryRoutes>
      <Route path="/connection" element={<CreateSourceEntry />} />
      <Route path="/postgres" element={<NewPostgresSource />} />
    </SentryRoutes>
  );
};

export const sourceErrorsPath = (regionSlug: string, source: Source) => {
  return `/regions/${regionSlug}/sources/${relativeSourceErrorsPath(source)}`;
};

export const relativeSourceErrorsPath = (source: SchemaObject) => {
  return `${relativeObjectPath(source)}/errors`;
};

const SourceOrRedirect: React.FC<{ sourcesResponse: SourcesResponse }> = ({
  sourcesResponse,
}) => {
  const { data: sources } = sourcesResponse;
  const params = useParams();
  const result = objectOrRedirect(params, sources, relativeSourceErrorsPath);
  if (result.type === "redirect") {
    return result.redirect;
  } else {
    return <SourceDetail sourcesResponse={sourcesResponse} />;
  }
};

export default SourceRoutes;
