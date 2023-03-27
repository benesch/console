import { Box, Flex, HStack, Text, useTheme } from "@chakra-ui/react";
import React from "react";
import ReactSelect, { OptionProps } from "react-select";

import useSchemas, { Schema } from "~/api/materialize/useSchemas";
import CheckmarkIcon from "~/svg/CheckmarkIcon";
import { buildReactSelectStyles, MaterializeTheme } from "~/theme";
import { useQueryStringState } from "~/useQueryString";

import { DatabaseFilterProps } from "./DatabaseFilter";

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
  } = useTheme<MaterializeTheme>();
  if (!schemaList) return null;

  const options: Schema[] = [
    { id: 1234, name: "All Schemas", databaseId: 0, databaseName: "" },
    ...schemaList,
  ];

  return (
    <ReactSelect
      aria-label="Schema filter"
      components={{ Option: Option }}
      isMulti={false}
      isSearchable={false}
      onChange={(value) => {
        value && setSelectedSchema(value.id);
      }}
      getOptionValue={(option) => option.id.toString()}
      formatOptionLabel={(data) => data.name}
      options={options}
      value={selectedSchema ?? options[0]}
      styles={buildReactSelectStyles<Schema, false>(semanticColors, {
        control: (styles) => ({
          ...styles,
          width: "130px",
        }),
      })}
    />
  );
};

const Option: React.FunctionComponent<
  React.PropsWithChildren<OptionProps<Schema, false>>
> = (props) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <Box
      ref={props.innerRef}
      {...props.innerProps}
      _hover={{
        backgroundColor: semanticColors.background.secondary,
      }}
      height="32px"
      pr="4"
      width="100%"
    >
      <HStack spacing="0">
        <Flex justifyContent="center" width="40px">
          {props.isSelected && <CheckmarkIcon />}
        </Flex>
        {props.data.databaseName && (
          <Text color={semanticColors.foreground.secondary} as="span">
            {props.data.databaseName}.
          </Text>
        )}

        <Text as="span">{props.data.name}</Text>
      </HStack>
    </Box>
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
