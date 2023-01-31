import { useInterval } from "@chakra-ui/react";
import React from "react";
import { Route, useParams } from "react-router-dom";

import { SchemaObject, Source, useSources } from "~/api/materialized";
import SourcesList from "~/platform/sources/SourcesList";
import { SentryRoutes } from "~/sentry";
import { isPollingDisabled } from "~/util";

import {
  objectOrRedirect,
  relativeObjectPath,
} from "../schemaObjectRouteHelpers";
import SourceDetail from "./SourceDetail";

export type ClusterDetailParams = {
  clusterName: string;
};

const SourceRoutes = () => {
  const { data: sources, refetch } = useSources();
  useInterval(refetch, isPollingDisabled() ? null : 5000);

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
  return `/${regionSlug}/sources/${relativeSourceErrorsPath(source)}`;
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
