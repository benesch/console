import React from "react";
import { Route, useParams } from "react-router-dom";

import { SchemaObject, Sink, useSinks } from "~/api/materialized";
import { useDatabaseFilter } from "~/components/DatabaseFilter";
import { useSchemaFilter } from "~/components/SchemaFilter";
import SinksList from "~/platform/sinks/SinksList";
import { SentryRoutes } from "~/sentry";
import useForegroundInterval from "~/useForegroundInterval";
import { useQueryStringState } from "~/useQueryString";

import {
  objectOrRedirect,
  relativeObjectPath,
  SchemaObjectRouteParams,
} from "../schemaObjectRouteHelpers";
import SinkDetail from "./SinkDetail";

export type ClusterDetailParams = {
  clusterName: string;
};

const sinkNameFilterQueryStringKey = "nameFilter";

const SinkRoutes = () => {
  const databaseFilter = useDatabaseFilter();
  const schemaFitler = useSchemaFilter(
    databaseFilter.setSelectedDatabase,
    databaseFilter.selectedDatabase?.id
  );
  const [sinkName, setSinkName] = useQueryStringState(
    sinkNameFilterQueryStringKey
  );
  const {
    data: sinks,
    loading,
    refetch,
  } = useSinks({
    databaseId: databaseFilter.selectedDatabase?.id,
    schemaId: schemaFitler.selectedSchema?.id,
    nameFilter: sinkName,
  });
  useForegroundInterval(() => !loading && refetch());
  return (
    <SentryRoutes>
      <Route
        path="/"
        element={
          <SinksList
            databaseFilter={databaseFilter}
            schemaFitler={schemaFitler}
            nameFilter={{ sinkName, setSinkName }}
            sinks={sinks}
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
