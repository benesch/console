import { useInterval } from "@chakra-ui/react";
import React from "react";
import { Route, useParams } from "react-router-dom";

import { SchemaObject, Sink, useSinks } from "~/api/materialized";
import SinksList from "~/platform/sinks/SinksList";
import { SentryRoutes } from "~/sentry";
import { useIsPollingDisabled } from "~/util";

import {
  objectOrRedirect,
  relativeObjectPath,
  SchemaObjectRouteParams,
} from "../schemaObjectRouteHelpers";
import SinkDetail from "./SinkDetail";

export type ClusterDetailParams = {
  clusterName: string;
};

const SinkRoutes = () => {
  const { data: sinks, refetch } = useSinks();
  const isPollingDisabled = useIsPollingDisabled();
  useInterval(refetch, isPollingDisabled ? null : 5000);
  return (
    <SentryRoutes>
      <Route path="/" element={<SinksList sinks={sinks} />} />
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
