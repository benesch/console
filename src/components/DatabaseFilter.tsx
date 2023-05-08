import { useTheme } from "@chakra-ui/react";
import React from "react";
import ReactSelect, { GroupBase } from "react-select";

import { Database } from "~/api/materialize/useDatabases";
import { DropdownIndicator, Option } from "~/components/reactSelectComponents";
import { buildReactSelectFilterStyles, MaterializeTheme } from "~/theme";

export interface DatabaseFilterProps {
  databaseList: Database[] | null;
  selected: Database | undefined;
  setSelectedDatabase: (id: string) => void;
}

const DatabaseFilter = ({
  databaseList,
  selected,
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
      options: [{ id: "0", name: "All Databases" }, ...databaseList],
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
      value={selected ?? options[0].options[0]}
      styles={buildReactSelectFilterStyles<Database, false>(
        semanticColors,
        shadows
      )}
    />
  );
};

export default DatabaseFilter;
