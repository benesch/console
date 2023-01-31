import { useInterval } from "@chakra-ui/react";
import React from "react";
import { Navigate, Params, Route, useParams } from "react-router-dom";

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
    <>
      <SentryRoutes>
        <Route path="/" element={<SourcesList sources={sources} />} />
        <Route
          path=":id/:databaseName/:schemaName/:sourceName/*"
          element={<SourceOrRedirect sources={sources} />}
        />
      </SentryRoutes>
    </>
  );
};

export const sourceErrorsPath = (regionSlug: string, source: Source) => {
  return `/${regionSlug}/sources/${sourceErrorsPathRelative(source)}`;
};
const sourceErrorsPathRelative = (source: Source) => {
  return `${source.id}/${source.databaseName}/${source.schemaName}/${source.name}/errors`;
};

export const handleRecreatedSource = (
  sources: Source[],
  params: Readonly<Params<string>>
) => {
  const source = sources.find(
    (s) =>
      s.databaseName == params.databaseName &&
      s.schemaName === params.schemaName &&
      s.name === params.sourceName
  );
  // The source must have been recreated, since the name matches, but the ID doesn't,
  // so redirect the user to the new path
  if (source) {
    return <Navigate to={`../${sourceErrorsPathRelative(source)}`} replace />;
  } else {
    return <Navigate to=".." replace />;
  }
};

export const handleRenamedSource = (
  source: Source,
  params: Readonly<Params<string>>
) => {
  // The source must have been renamed, redirect the user to the updated path
  if (
    source.databaseName !== params.databaseName ||
    source.schemaName !== params.schemaName ||
    source.name !== params.sourceName
  ) {
    return <Navigate to={`../${sourceErrorsPathRelative(source)}`} replace />;
  } else {
    return <SourceDetail source={source} />;
  }
};

const SourceOrRedirect: React.FC<{ sources: Source[] | null }> = ({
  sources,
}) => {
  const params = useParams();
  // If sources haven't loaded, show the loading state
  if (!sources) {
    return <SourceDetail />;
  }
  const source = sources?.find((s) => s.id == params.id);
  if (source) {
    return handleRenamedSource(source, params);
  }
  if (!source) {
    return handleRecreatedSource(sources, params);
  }
  return <SourceDetail source={source} />;
};

export default SourceRoutes;
