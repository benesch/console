import React from "react";
import { useNavigate } from "react-router-dom";

import useDatabases, { Database } from "~/api/materialize/useDatabases";

import SimpleSelect from "./SimpleSelect";

export interface DatabaseFilterProps {
  databaseList: Database[] | null;
  selectedDatabase: Database | undefined;
  setSelectedDatabase: (id: number) => void;
}

const databaseQueryStringKey = "database" as const;

const DatabaseFilter = ({
  databaseList,
  selectedDatabase,
  setSelectedDatabase,
}: DatabaseFilterProps) => {
  return (
    <SimpleSelect
      value={selectedDatabase?.id ?? "all"}
      onChange={(e) => {
        const id = parseInt(e.target.value);
        setSelectedDatabase(id);
      }}
    >
      <option value="0">All databases</option>
      {databaseList &&
        databaseList.map((database) => (
          <option key={database.id} value={database.id}>
            {database.name}
          </option>
        ))}
    </SimpleSelect>
  );
};

export const useDatabaseFilter = () => {
  const navigate = useNavigate();
  const [selectedDatabase, setSelectedDatabase] = React.useState<
    Database | undefined
  >(undefined);
  const { data: databaseList } = useDatabases();

  const setDatabase = React.useCallback(
    (id: number) => {
      const url = new URL(window.location.toString());
      if (id === 0) {
        setSelectedDatabase(undefined);
        url.searchParams.delete(databaseQueryStringKey);
        navigate(url.pathname + url.search + url.hash, { replace: true });
      }
      const database = databaseList && databaseList.find((d) => d.id === id);
      if (database) {
        setSelectedDatabase(database);
        url.searchParams.set(databaseQueryStringKey, database.name);
        navigate(url.pathname + url.search + url.hash, { replace: true });
      }
    },
    [databaseList, navigate]
  );

  React.useEffect(() => {
    const url = new URL(window.location.toString());
    const name = url.searchParams.get(databaseQueryStringKey);
    const database = databaseList && databaseList.find((d) => d.name === name);
    if (database) {
      setSelectedDatabase(database);
    }
  }, [databaseList]);

  return {
    databaseList,
    selectedDatabase,
    setSelectedDatabase: setDatabase,
  };
};

export default DatabaseFilter;
