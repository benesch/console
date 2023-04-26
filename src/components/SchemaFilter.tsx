import { Text, useTheme } from "@chakra-ui/react";
import React from "react";
import ReactSelect, { GroupBase } from "react-select";

import { Schema } from "~/api/materialize/useSchemas";
import { DropdownIndicator, Option } from "~/components/reactSelectComponents";
import { buildReactSelectStyles, MaterializeTheme } from "~/theme";

export interface SchemaFilterProps {
  schemaList: Schema[] | null;
  selected: Schema | undefined;
  setSelectedSchema: (id: string) => void;
}

const SchemaFilter = ({
  schemaList,
  selected,
  setSelectedSchema,
}: SchemaFilterProps) => {
  const {
    colors: { semanticColors },
    shadows,
  } = useTheme<MaterializeTheme>();
  if (!schemaList) return null;

  const options: GroupBase<Schema>[] = [
    {
      label: "Filter by schmea",
      options: [
        { id: "0", name: "All Schemas", databaseId: "0", databaseName: "" },
        ...schemaList,
      ],
    },
  ];

  return (
    <ReactSelect<Schema, false, GroupBase<Schema>>
      aria-label="Schema filter"
      components={{
        Option: Option,
        DropdownIndicator: DropdownIndicator,
      }}
      isMulti={false}
      isSearchable={false}
      onChange={(value) => {
        value && setSelectedSchema(value.id);
      }}
      getOptionValue={(option) => option.id.toString()}
      formatOptionLabel={(data) => (
        <>
          {data.databaseName && (
            <Text color={semanticColors.foreground.secondary} as="span">
              {data.databaseName}.
            </Text>
          )}
          {data.name}
        </>
      )}
      options={options}
      value={selected ?? options[0].options[0]}
      styles={buildReactSelectStyles<Schema, false>(
        semanticColors,
        shadows,
        {}
      )}
    />
  );
};

export default SchemaFilter;
