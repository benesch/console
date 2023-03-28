import { Box, Flex, HStack, Text, useTheme } from "@chakra-ui/react";
import React from "react";
import { HashRouter } from "react-router-dom";
import ReactSelect, {
  MenuListProps,
  MenuProps,
  OptionProps,
} from "react-select";

import useDatabases, { Database } from "~/api/materialize/useDatabases";
import CheckmarkIcon from "~/svg/CheckmarkIcon";
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
  } = useTheme<MaterializeTheme>();
  if (!databaseList) return null;

  const options: Database[] = [
    { id: 0, name: "All Databases" },
    ...databaseList,
  ];
  return (
    <ReactSelect
      aria-label="Database filter"
      components={{ Option: Option, MenuList: MenuList }}
      isMulti={false}
      isSearchable={false}
      onChange={(value) => {
        value && setSelectedDatabase(value.id);
      }}
      getOptionValue={(option) => option.id.toString()}
      formatOptionLabel={(data) => data.name}
      options={options}
      value={selectedDatabase ?? options[0]}
      styles={buildReactSelectStyles<Database, false>(semanticColors, {
        control: (styles) => ({
          ...styles,
        }),
      })}
    />
  );
};

const MenuList: React.FunctionComponent<
  React.PropsWithChildren<MenuListProps<Database, false>>
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
          overflow="hidden"
        >
          Filter by database
        </Text>
      </HStack>
      {props.children}
    </Box>
  );
};

const Option: React.FunctionComponent<
  React.PropsWithChildren<OptionProps<Database, false>>
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
        <Text fontSize="14px" lineHeight="16px" userSelect="none">
          {props.data.name}
        </Text>
      </HStack>
    </Box>
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
