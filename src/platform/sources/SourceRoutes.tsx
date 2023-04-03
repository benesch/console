import React from "react";
import { Route, useParams } from "react-router-dom";

import useSources, { Source } from "~/api/materialize/useSources";
import { SchemaObject } from "~/api/materialized";
import { useDatabaseFilter } from "~/components/DatabaseFilter";
import { useSchemaFilter } from "~/components/SchemaFilter";
import SourcesList from "~/platform/sources/SourcesList";
import { SentryRoutes } from "~/sentry";
import useForegroundInterval from "~/useForegroundInterval";
import { useQueryStringState } from "~/useQueryString";

import {
  objectOrRedirect,
  relativeObjectPath,
} from "../schemaObjectRouteHelpers";
import SourceDetail from "./SourceDetail";

const sourceNameFilterQueryStringKey = "nameFilter";

const SourceRoutes = () => {
  const databaseFilter = useDatabaseFilter();
  const schemaFilter = useSchemaFilter(
    databaseFilter.setSelectedDatabase,
    databaseFilter.selectedDatabase?.id
  );
  const [sourceName, setSourceName] = useQueryStringState(
    sourceNameFilterQueryStringKey
  );
  const {
    data: sources,
    loading,
    refetch,
  } = useSources({
    databaseId: databaseFilter.selectedDatabase?.id,
    schemaId: schemaFilter.selectedSchema?.id,
    nameFilter: sourceName,
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
              nameFilter={{ sourceName, setSourceName }}
              sources={sources}
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
