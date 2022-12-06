import { useInterval } from "@chakra-ui/react";
import React from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

import { Source, useSources } from "~/api/materialized";
import SourcesList from "~/platform/sources/SourcesList";
import { isPollingDisabled } from "~/util";

import SourceDetail from "./SourceDetail";

export type ClusterDetailParams = {
  clusterName: string;
};

const SourceRoutes = () => {
  const { sources, refetch } = useSources();
  useInterval(refetch, isPollingDisabled() ? null : 5000);
  return (
    <Routes>
      <Route path="/" element={<SourcesList sources={sources} />} />
      <Route
        path=":sourceName"
        element={<SourceOrRedirect sources={sources} />}
      />
    </Routes>
  );
};

const SourceOrRedirect: React.FC<{ sources: Source[] | null }> = ({
  sources,
}) => {
  const params = useParams();
  const source = sources?.find((c) => c.name === params.sourceName);
  if (sources && !source) {
    return <Navigate to="/sources" replace />;
  } else {
    return <SourceDetail source={source} />;
  }
};

export default SourceRoutes;
