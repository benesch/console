import React from "react";
import { Route, useParams } from "react-router-dom";

import { SchemaObject, Sink, useSinks } from "~/api/materialized";
import SinksList from "~/platform/sinks/SinksList";
import { SentryRoutes } from "~/sentry";
import { usePoll } from "~/useForegroundInterval";
import useSchemaObjectFilters from "~/useSchemaObjectFilters";

import {
  objectOrRedirect,
  relativeObjectPath,
  SchemaObjectRouteParams,
} from "../schemaObjectRouteHelpers";
import SinkDetail from "./SinkDetail";

export type ClusterDetailParams = {
  clusterName: string;
};

const NAME_FILTER_QUERY_STRING_KEY = "sinkName";

const SinkRoutes = () => {
  const { databaseFilter, schemaFilter, nameFilter } = useSchemaObjectFilters(
    NAME_FILTER_QUERY_STRING_KEY
  );
  const {
    data: sinks,
    loading,
    refetch,
  } = useSinks({
    databaseId: databaseFilter.selected?.id,
    schemaId: schemaFilter.selected?.id,
    nameFilter: nameFilter.name,
  });
  const isPolling = usePoll(loading, refetch);

  return (
    <SentryRoutes>
      <Route
        path="/"
        element={
          <SinksList
            databaseFilter={databaseFilter}
            schemaFilter={schemaFilter}
            nameFilter={nameFilter}
            sinks={sinks}
            loading={loading}
            isPolling={isPolling}
          />
        }
      />
      <Route
        path=":id/:databaseName/:schemaName/:objectName/*"
        element={<SinkOrRedirect sinks={sinks} />}
      />
    </SentryRoutes>
  );
};

export const sinkErrorsPath = (regionSlug: string, sink: Sink) => {
  return `/regions/${regionSlug}/sinks/${relativeSinkErrorsPath(sink)}`;
};

const relativeSinkErrorsPath = (sink: SchemaObject) => {
  return `${relativeObjectPath(sink)}/errors`;
};

const SinkOrRedirect: React.FC<{ sinks: Sink[] | null }> = ({ sinks }) => {
  const params = useParams<SchemaObjectRouteParams>();
  const result = objectOrRedirect(params, sinks, relativeSinkErrorsPath);
  if (result.type === "redirect") {
    return result.redirect;
  } else {
    return <SinkDetail sink={result.object} />;
  }
};

export default SinkRoutes;
