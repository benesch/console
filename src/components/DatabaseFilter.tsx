import { useTheme } from "@chakra-ui/react";
import React from "react";
import ReactSelect, { GroupBase } from "react-select";

import useDatabases, { Database } from "~/api/materialize/useDatabases";
import { DropdownIndicator, Option } from "~/components/reactSelectComponents";
import { buildReactSelectStyles, MaterializeTheme } from "~/theme";
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
  const {
    colors: { semanticColors },
    shadows,
  } = useTheme<MaterializeTheme>();
  if (!databaseList) return null;

  const options: GroupBase<Database>[] = [
    {
      label: "Filter by database",
      options: [{ id: 0, name: "All Databases" }, ...databaseList],
    },
  ];
  return (
    <ReactSelect<Database, false, GroupBase<Database>>
      aria-label="Database filter"
      components={{
        Option: Option,
        DropdownIndicator: DropdownIndicator<Database>,
      }}
      isMulti={false}
      isSearchable={false}
      onChange={(value) => {
        value && setSelectedDatabase(value.id);
      }}
      getOptionValue={(option) => option.id.toString()}
      formatOptionLabel={(data) => data.name}
      options={options}
      value={selectedDatabase ?? options[0].options[0]}
      styles={buildReactSelectStyles<Database, false>(
        semanticColors,
        shadows,
        {}
      )}
    />
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

      setSelectedDatabaseName(selected?.name);
    },
    [databaseList, setSelectedDatabaseName]
  );

  return {
    databaseList,
    selectedDatabase,
    setSelectedDatabase,
  };
};

export default DatabaseFilter;
