import { useInterval } from "@chakra-ui/react";
import React from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

import { Sink, useSinks } from "~/api/materialized";
import SinksList from "~/platform/sinks/SinksList";
import { isPollingDisabled } from "~/util";

import SinkDetail from "./SinkDetail";

export type ClusterDetailParams = {
  clusterName: string;
};

const SinkRoutes = () => {
  const { sinks, refetch } = useSinks();
  useInterval(refetch, isPollingDisabled() ? null : 5000);
  return (
    <Routes>
      <Route path="/" element={<SinksList sinks={sinks} />} />
      <Route path=":sinkName/*" element={<SinkOrRedirect sinks={sinks} />} />
    </Routes>
  );
};

const SinkOrRedirect: React.FC<{ sinks: Sink[] | null }> = ({ sinks }) => {
  const params = useParams();
  const sink = sinks?.find((c) => c.name === params.sinkName);
  if (sinks && !sink) {
    return <Navigate to="/sinks" replace />;
  } else {
    return <SinkDetail sink={sink} />;
  }
};

export default SinkRoutes;
