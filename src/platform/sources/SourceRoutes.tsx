import { useInterval } from "@chakra-ui/react";
import React from "react";
import { Navigate, Route, useParams } from "react-router-dom";

import { Source, useSources } from "~/api/materialized";
import SourcesList from "~/platform/sources/SourcesList";
import { SentryRoutes } from "~/sentry";
import { isPollingDisabled } from "~/util";

import SourceDetail from "./SourceDetail";

export type ClusterDetailParams = {
  clusterName: string;
};

const SourceRoutes = () => {
  const { data: sources, refetch } = useSources();
  useInterval(refetch, isPollingDisabled() ? null : 5000);
  return (
    <SentryRoutes>
      <Route path="/" element={<SourcesList sources={sources} />} />
      <Route
        path=":databaseName/:schemaName/:sourceName/*"
        element={<SourceOrRedirect sources={sources} />}
      />
    </SentryRoutes>
  );
};

export const sourceErrorsPath = (regionSlug: string, source: Source) => {
  return `/${regionSlug}/sources/${source.databaseName}/${source.schemaName}/${source.name}/errors`;
};

const SourceOrRedirect: React.FC<{ sources: Source[] | null }> = ({
  sources,
}) => {
  const params = useParams();
  const source = sources?.find(
    (c) => c.name === params.sourceName && c.schemaName === params.schemaName
  );
  if (sources && !source) {
    return <Navigate to="/sources" replace />;
  } else {
    return <SourceDetail source={source} />;
  }
};

export default SourceRoutes;
