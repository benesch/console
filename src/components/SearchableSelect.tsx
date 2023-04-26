import { useTheme } from "@chakra-ui/react";
import React from "react";
import ReactSelect, { GroupBase, Props } from "react-select";

import { DropdownIndicator, Option } from "~/components/reactSelectComponents";
import { buildReactSelectStyles, MaterializeTheme } from "~/theme";

export type SelectOption = { id: string; name: string };

export interface SearchableSelectProps
  extends Props<SelectOption, false, GroupBase<SelectOption>> {
  ariaLabel: string;
  options: SelectOption[];
  sectionLabel: string;
}

const SearchableSelect = React.forwardRef(
  (
    { options, ariaLabel, sectionLabel, ...props }: SearchableSelectProps,
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
        ref={ref}
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
        {...props}
      />
    );
  }
);

export default SearchableSelect;
