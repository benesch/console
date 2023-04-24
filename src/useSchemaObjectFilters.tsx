import React from "react";

import useDatabases from "./api/materialize/useDatabases";
import useSchemas from "./api/materialize/useSchemas";
import { useQueryStringState } from "./useQueryString";

const namespaceQueryStringKey = "namespace" as const;

const useSchemaObjectFilters = (nameFilterKey: string) => {
  const [selectedNamespace, setSelectedNamespace] = useQueryStringState(
    namespaceQueryStringKey
  );
  const [nameValue, setNameValue] = useQueryStringState(nameFilterKey);

  const { data: databaseList } = useDatabases();
  const [databaseName, schemaName] = React.useMemo(
    () => (selectedNamespace ?? "").split("."),
    [selectedNamespace]
  );
  const selectedDatabase = React.useMemo(
    () =>
      (databaseList && databaseList.find((d) => d.name === databaseName)) ??
      undefined,
    [databaseList, databaseName]
  );
  const setSelectedDatabase = React.useCallback(
    (id: string) => {
      const selected = databaseList && databaseList.find((d) => d.id === id);

      setSelectedNamespace(selected?.name);
    },
    [databaseList, setSelectedNamespace]
  );

  const { data: schemaList } = useSchemas(selectedDatabase?.id);
  const selectedSchema = React.useMemo(() => {
    return (
      (schemaList &&
        schemaList.find(
          (s) => s.name === schemaName && s.databaseName === databaseName
        )) ??
      undefined
    );
  }, [databaseName, schemaList, schemaName]);
  const setSelectedSchema = React.useCallback(
    (id: string) => {
      const selected = schemaList && schemaList.find((d) => d.id === id);

      setSelectedNamespace(
        selected ? `${selected.databaseName}.${selected.name}` : undefined
      );
    },
    [schemaList, setSelectedNamespace]
  );

  return {
    schemaFilter: {
      schemaList,
      selected: selectedSchema,
      setSelectedSchema,
    },
    databaseFilter: {
      databaseList,
      selected: selectedDatabase,
      setSelectedDatabase,
    },
    nameFilter: {
      name: nameValue,
      setName: setNameValue,
    },
  };
};

export type SchemaObjectFilters = ReturnType<typeof useSchemaObjectFilters>;
export type DatabaseFilterState = SchemaObjectFilters["databaseFilter"];
export type SchemaFilterState = SchemaObjectFilters["schemaFilter"];
export type NameFilterState = SchemaObjectFilters["nameFilter"];

export default useSchemaObjectFilters;
