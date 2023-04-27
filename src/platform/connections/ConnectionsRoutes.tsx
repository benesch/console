import React from "react";
import { Route } from "react-router-dom";

import useConnections from "~/api/materialize/useConnections";
import { SentryRoutes } from "~/sentry";
import useSchemaObjectFilters from "~/useSchemaObjectFilters";

import ConnectionsList from "./ConnectionsList";
import ConnectionsCreateEntry from "./create/ConnectionsCreateEntry";

const NAME_FILTER_QUERY_STRING_KEY = "connectionName";

const ConnectionsRoutes = () => {
  const schemaObjectFilters = useSchemaObjectFilters(
    NAME_FILTER_QUERY_STRING_KEY
  );
  const { databaseFilter, schemaFilter, nameFilter } = schemaObjectFilters;
  const connectionsResponse = useConnections({
    databaseId: databaseFilter.selected?.id,
    schemaId: schemaFilter.selected?.id,
    nameFilter: nameFilter.name,
  });

  return (
    <SentryRoutes>
      <Route
        path="/"
        element={
          <ConnectionsList
            schemaObjectFilters={schemaObjectFilters}
            connectionsResponse={connectionsResponse}
          />
        }
      />
      <Route path="new" element={<ConnectionsCreateEntry />} />
    </SentryRoutes>
  );
};

export default ConnectionsRoutes;
