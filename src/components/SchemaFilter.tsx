import { Text, useTheme } from "@chakra-ui/react";
import React from "react";
import ReactSelect, { GroupBase } from "react-select";

import useSchemas, { Schema } from "~/api/materialize/useSchemas";
import { DatabaseFilterProps } from "~/components/DatabaseFilter";
import { DropdownIndicator, Option } from "~/components/reactSelectComponents";
import { buildReactSelectStyles, MaterializeTheme } from "~/theme";
import { useQueryStringState } from "~/useQueryString";

export interface SchemaFilterProps {
  schemaList: Schema[] | null;
  selectedSchema: Schema | undefined;
  setSelectedSchema: (id: number) => void;
}

const schemaQueryStringKey = "schema" as const;

const SchemaFilter = ({
  schemaList,
  selectedSchema,
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
        { id: 0, name: "All Schemas", databaseId: 0, databaseName: "" },
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
            <Text
              color={semanticColors.foreground.secondary}
              fontSize="14px"
              lineHeight="16px"
              userSelect="none"
              as="span"
            >
              {data.databaseName}.
            </Text>
          )}
          <Text as="span" fontSize="14px" lineHeight="16px">
            {data.name}
          </Text>
        </>
      )}
      options={options}
      value={selectedSchema ?? options[0].options[0]}
      styles={buildReactSelectStyles<Schema, false>(
        semanticColors,
        shadows,
        {}
      )}
    />
  );
};

export const useSchemaFilter = (
  setSelectedDatabase: DatabaseFilterProps["setSelectedDatabase"],
  selectedDatabaseId?: number
) => {
  const [selectedSchemaName, setSelectedSchemaName] =
    useQueryStringState(schemaQueryStringKey);
  const { data: schemaList } = useSchemas(selectedDatabaseId);
  const selectedSchema = React.useMemo(
    () =>
      (schemaList && schemaList.find((d) => d.name === selectedSchemaName)) ??
      undefined,
    [schemaList, selectedSchemaName]
  );

  const setSelectedSchema = React.useCallback(
    (id: number) => {
      const selected = schemaList && schemaList.find((d) => d.id === id);

      setSelectedDatabase(selected?.databaseId ?? 0);
      setSelectedSchemaName(selected?.name ?? undefined);
    },
    [schemaList, setSelectedDatabase, setSelectedSchemaName]
  );

  return {
    schemaList,
    selectedSchema,
    setSelectedSchema: setSelectedSchema,
  };
};

export default SchemaFilter;
