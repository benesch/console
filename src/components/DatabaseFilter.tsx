import React from "react";
import { useNavigate } from "react-router-dom";

import useDatabases, { Database } from "~/api/materialize/useDatabases";

import SimpleSelect from "./SimpleSelect";

export interface DatabaseFilterProps {
  databaseList: Database[] | null;
  selectedDatabase: Database | undefined;
  setSelectedDatabase: React.Dispatch<
    React.SetStateAction<Database | undefined>
  >;
}

const DatabaseFilter = ({
  databaseList,
  selectedDatabase,
  setSelectedDatabase,
}: DatabaseFilterProps) => {
  const navigate = useNavigate();
  const setDatabase = (id: number) => {
    const url = new URL(window.location.toString());
    if (id === 0) {
      setSelectedDatabase(undefined);
      url.searchParams.delete("database");
      navigate(url.pathname + url.search + url.hash, { replace: true });
    }
    const database = databaseList && databaseList.find((d) => d.id === id);
    if (database) {
      setSelectedDatabase(database);
      url.searchParams.set("database", database.name);
      navigate(url.pathname + url.search + url.hash, { replace: true });
    }
  };

  return (
    <SimpleSelect
      value={selectedDatabase?.id ?? "all"}
      onChange={(e) => {
        const id = parseInt(e.target.value);
        setDatabase(id);
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
  const [selectedDatabase, setSelectedDatabase] = React.useState<
    Database | undefined
  >(undefined);

  const { data: databaseList } = useDatabases();

  return {
    databaseList,
    selectedDatabase,
    setSelectedDatabase,
  };
};

export default DatabaseFilter;
