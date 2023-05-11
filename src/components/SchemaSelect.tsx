import React from "react";
import { components, createFilter, SingleValueProps } from "react-select";

import { buildSchemaSelectOptions, Schema } from "~/api/materialize/useSchemas";

import SearchableSelect, { SearchableSelectProps } from "./SearchableSelect";

export interface SchemaSelectProps
  extends Omit<SearchableSelectProps<Schema>, "ariaLabel" | "options"> {
  schemas: Schema[];
}

const SingleValue = ({ children, ...props }: SingleValueProps<Schema>) => (
  <components.SingleValue
    {...props}
  >{`${props.data.databaseName}.${props.data.name}`}</components.SingleValue>
);

const SchemaSelect = React.forwardRef(
  ({ schemas, ...props }: SchemaSelectProps, ref: React.Ref<any>) => {
    const schemaSelectOptions = React.useMemo(
      () => buildSchemaSelectOptions(schemas ?? []),
      [schemas]
    );
    return (
      <SearchableSelect<Schema>
        ariaLabel="Select schema"
        ref={ref}
        placeholder="Select one"
        components={{ SingleValue }}
        options={schemaSelectOptions}
        filterOption={createFilter<Schema>({
          stringify: (option) =>
            `${option.data.databaseName}.${option.data.name}`,
        })}
        {...props}
      />
    );
  }
);

export default SchemaSelect;
