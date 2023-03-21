import { Select } from "@chakra-ui/react";
import React from "react";

import useDatabases, { Database } from "~/api/materialize/useDatabases";
import { useQueryStringState } from "~/useQueryString";

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
    <Select
      variant="borderless"
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
    </Select>
  );
};

export const useDatabaseFilter = () => {
  const [selectedDatabaseName, setSelectedDatabaseName] = useQueryStringState(
    databaseQueryStringKey
  );
  const { data: databaseList } = useDatabases();
  const selectedDatabase = React.useMemo(
    () =>
      (databaseList &&
        databaseList.find((d) => d.name === selectedDatabaseName)) ??
      undefined,
    [databaseList, selectedDatabaseName]
  );

  const setSelectedDatabase = React.useCallback(
    (id: number) => {
      const selected = databaseList && databaseList.find((d) => d.id === id);

      setSelectedDatabaseName(selected?.name ?? undefined);
    },
    [databaseList, setSelectedDatabaseName]
  );

  return {
    databaseList,
    selectedDatabase,
    setSelectedDatabase: setSelectedDatabase,
  };
};

export default DatabaseFilter;
