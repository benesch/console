import { Box, Flex, HStack, Text, useTheme } from "@chakra-ui/react";
import React from "react";
import ReactSelect, { OptionProps } from "react-select";

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
      components={{ Option: Option }}
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
          width: "160px",
        }),
      })}
    />
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
      height="32px"
      pr="4"
      width="100%"
    >
      <HStack spacing="0">
        <Flex justifyContent="center" width="40px">
          {props.isSelected && <CheckmarkIcon />}
        </Flex>
        <Text lineHeight="32px">{props.data.name}</Text>
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
