import { Box, Flex, Image, Text, useTheme } from "@chakra-ui/react";
import React from "react";
import ReactSelect, {
  GroupBase,
  mergeStyles,
  OptionProps,
  Props,
  StylesConfig,
} from "react-select";

import { DropdownIndicator } from "~/components/reactSelectComponents";
import plus from "~/img/plus.svg";
import { MaterializeTheme, ThemeColors, ThemeShadows } from "~/theme";

export type SelectOption = { id: string; name: string; display?: "addItem" };

export interface SearchableSelectProps
  extends Props<SelectOption, false, GroupBase<SelectOption>> {
  ariaLabel: string;
  options: SelectOption[];
  sectionLabel: string;
}

const buildStyles = <
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  semanticColors: ThemeColors,
  shadows: ThemeShadows
): StylesConfig<Option, IsMulti, Group> => {
  return mergeStyles({
    menu: (base) => ({
      ...base,
      position: "absolute",
      marginTop: "2px",
      minWidth: "240px",
      width: "100%",
      background: semanticColors.background.primary,
      border: "1px solid",
      borderColor: semanticColors.border.primary,
      boxShadow: shadows.level3,
      borderRadius: "8px",
      overflow: "hidden",
    }),
    menuList: (base) => ({
      ...base,
      padding: "0",
    }),
    control: (base, state) => ({
      ...base,
      color: semanticColors.foreground.secondary,
      fontSize: "14px",
      lineHeight: "16px",
      minHeight: "32px",
      padding: "0px",
      borderRadius: "8px",
      borderColor: semanticColors.border.secondary,
      boxShadow:
        "0px 0px 0.5px rgba(0, 0, 0, 0.16), 0px 0.5px 2px rgba(0, 0, 0, 0.12);",
      background: state.isFocused
        ? semanticColors.background.secondary
        : semanticColors.background.primary,
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: semanticColors.foreground.secondary,
      ":hover": {
        color: semanticColors.foreground.secondary,
      },
    }),
    groupHeading: (base) => ({
      ...base,
      color: semanticColors.foreground.tertiary,
      fontSize: "14px",
      fontWeight: "500",
      lineHeight: "16px",
      overflow: "hidden",
      padding: "6px 12px",
      margin: "0",
      textTransform: "none",
    }),
    group: (base) => ({
      ...base,
      padding: "4px 0 0",
    }),
    option: (base) => ({
      ...base,
      userSelect: "none",
      cursor: "pointer",
    }),
    input: (base) => ({
      ...base,
    }),
    indicatorSeparator: (base) => ({
      ...base,
      display: "none",
    }),
    valueContainer: (base) => ({
      ...base,
      paddingRight: "2px",
    }),
    singleValue: (base) => ({
      ...base,
      padding: 0,
      margin: 0,
    }),
  });
};

const AddButtonOrOption = (props: OptionProps<SelectOption, false>) => {
  const { data, isFocused, isSelected, innerRef, innerProps } = props;
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  if (data.display === "addItem") {
    return (
      <Flex
        {...innerProps}
        background={semanticColors.background.secondary}
        borderColor={semanticColors.border.secondary}
        borderTopWidth="1px"
        color={semanticColors.accent.brightPurple}
        cursor="pointer"
        p="3"
        ref={innerRef}
        textStyle="text-ui-reg"
      >
        <Image alt="Plus icon" src={plus} mr="2" />
        {data.name}
      </Flex>
    );
  }
  return (
    <Box
      ref={innerRef}
      {...innerProps}
      _hover={{
        backgroundColor: semanticColors.background.secondary,
      }}
      backgroundColor={
        isFocused || isSelected ? semanticColors.background.secondary : ""
      }
      px="3"
      py="6px"
      width="100%"
    >
      <Text userSelect="none" textStyle="text-base">
        {props.children}
      </Text>
    </Box>
  );
};

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
          Option: AddButtonOrOption,
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
        styles={buildStyles(semanticColors, shadows)}
        {...props}
      />
    );
  }
);

export default SearchableSelect;
