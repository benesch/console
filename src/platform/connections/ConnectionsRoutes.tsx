import React from "react";
import { Route } from "react-router-dom";

import useConnections from "~/api/materialize/connection/useConnections";
import { SentryRoutes } from "~/sentry";
import useSchemaObjectFilters from "~/useSchemaObjectFilters";

import ConnectionsList from "./ConnectionsList";
import CreateConnectionEntry from "./create/CreateConnectionEntry";
import NewKafkaConnection from "./create/NewKafkaConnection";
import NewPostgresConnection from "./create/NewPostgresConnection";

const NAME_FILTER_QUERY_STRING_KEY = "connectionName";

const ShowConnectionRoutes = () => {
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
        path="/*"
        element={
          <ConnectionsList
            schemaObjectFilters={schemaObjectFilters}
            connectionsResponse={connectionsResponse}
          />
        }
      />
    </SentryRoutes>
  );
};

const NewConnectionRoutes = () => {
  return (
    <SentryRoutes>
      <Route path="/connection" element={<CreateConnectionEntry />} />
      <Route path="/kafka" element={<NewKafkaConnection />} />
      <Route path="/postgres" element={<NewPostgresConnection />} />
    </SentryRoutes>
  );
};

const ConnectionsRoutes = () => {
  return (
    <SentryRoutes>
      <Route path="/new/*" element={<NewConnectionRoutes />} />
      <Route path="/*" element={<ShowConnectionRoutes />} />
    </SentryRoutes>
  );
};

export default ConnectionsRoutes;
