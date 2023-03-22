import { Select } from "@chakra-ui/react";
import React from "react";

import useSchemas, { Schema } from "~/api/materialize/useSchemas";
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
  return (
    <Select
      variant="borderless"
      value={selectedSchema?.id ?? "all"}
      onChange={(e) => {
        const id = parseInt(e.target.value);
        setSelectedSchema(id);
      }}
    >
      <option value="0">All schemas</option>
      {schemaList &&
        schemaList.map((schema) => (
          <option key={schema.id} value={schema.id}>
            {schema.databaseName}.{schema.name}
          </option>
        ))}
    </Select>
  );
};

export const useSchemaFilter = (databaseId?: number) => {
  const [selectedSchemaName, setSelectedSchemaName] =
    useQueryStringState(schemaQueryStringKey);
  const { data: schemaList } = useSchemas(databaseId);
  const selectedSchema = React.useMemo(
    () =>
      (schemaList && schemaList.find((d) => d.name === selectedSchemaName)) ??
      undefined,
    [schemaList, selectedSchemaName]
  );

  const setSelectedSchema = React.useCallback(
    (id: number) => {
      const selected = schemaList && schemaList.find((d) => d.id === id);

      setSelectedSchemaName(selected?.name ?? undefined);
    },
    [schemaList, setSelectedSchemaName]
  );

  return {
    schemaList,
    selectedSchema,
    setSelectedSchema: setSelectedSchema,
  };
};

export default SchemaFilter;
