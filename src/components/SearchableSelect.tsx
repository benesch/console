import { useTheme } from "@chakra-ui/react";
import React from "react";
import ReactSelect, { GroupBase } from "react-select";

import { DropdownIndicator, Option } from "~/components/reactSelectComponents";
import { buildReactSelectStyles, MaterializeTheme } from "~/theme";

export type SelectOption = { id: string; name: string };

export interface SearchableSelectProps {
  ariaLabel: string;
  onChange: (value: SelectOption) => void;
  options: SelectOption[];
  placeholder?: string;
  sectionLabel: string;
  value: SelectOption | null;
}

const SearchableSelect = React.forwardRef(
  (
    {
      options,
      ariaLabel,
      onChange,
      placeholder,
      sectionLabel,
      value,
    }: SearchableSelectProps,
    ref: React.Ref<any>
  ) => {
    const {
      colors: { semanticColors },
      shadows,
    } = useTheme<MaterializeTheme>();

    return (
      <ReactSelect<SelectOption, false, GroupBase<SelectOption>>
        aria-label={ariaLabel}
        components={{
          Option: Option,
          DropdownIndicator: DropdownIndicator,
        }}
        formatOptionLabel={(data) => data.name}
        getOptionValue={(option) => option.name}
        isMulti={false}
        isSearchable
        onChange={(newValue) => {
          newValue && onChange(newValue);
        }}
        ref={ref}
        placeholder={placeholder}
        options={[
          {
            label: sectionLabel,
            options,
          },
        ]}
        styles={buildReactSelectStyles<SelectOption, false>(
          semanticColors,
          shadows,
          {}
        )}
        value={value}
      />
    );
  }
);

export default SearchableSelect;
