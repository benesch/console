import { Box, Flex, HStack, Text, useTheme } from "@chakra-ui/react";
import React from "react";
import ReactSelect, { MenuListProps, OptionProps } from "react-select";

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
      components={{ Option: Option, MenuList: MenuList }}
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

const MenuList: React.FunctionComponent<
  React.PropsWithChildren<MenuListProps<Schema, false>>
> = (props) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <Box ref={props.innerRef} {...props.innerProps} py="4px">
      <HStack px="16px" py="8px">
        <Text
          fontSize="14px"
          lineHeight="16px"
          fontWeight="500"
          color={semanticColors.foreground.tertiary}
        >
          Filter by schema
        </Text>
      </HStack>
      {props.children}
    </Box>
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
      py="8px"
      pr="4"
      width="100%"
    >
      <HStack spacing="0" alignItems="center" justifyContent="start">
        <Flex justifyContent="center" width="40px">
          {props.isSelected && (
            <CheckmarkIcon color={semanticColors.accent.brightPurple} />
          )}
        </Flex>
        {props.data.databaseName && (
          <Text
            color={semanticColors.foreground.secondary}
            fontSize="14px"
            lineHeight="16px"
            userSelect="none"
            as="span"
          >
            {props.data.databaseName}.
          </Text>
        )}
        <Text as="span" fontSize="14px" lineHeight="16px">
          {props.data.name}
        </Text>
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
