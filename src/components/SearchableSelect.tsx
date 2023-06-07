import { CloseIcon } from "@chakra-ui/icons";
import { Box, Flex, Image, Text, useTheme } from "@chakra-ui/react";
import React, { ComponentProps } from "react";
import ReactSelect, {
  components as ReactSelectComponents,
  GroupBase,
  mergeStyles,
  OptionProps,
  OptionsOrGroups,
  Props,
  StylesConfig,
} from "react-select";
import { ClearIndicatorProps } from "react-select/dist/declarations/src/components/indicators";

import { DropdownIndicator } from "~/components/reactSelectComponents";
import plus from "~/img/plus.svg";
import { MaterializeTheme, ThemeColors, ThemeShadows } from "~/theme";

declare module "react-select/dist/declarations/src/Select" {
  export interface Props<
    Option,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IsMulti extends boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Group extends GroupBase<Option>
  > {
    variant?: "default" | "error";
  }
}

export type SelectOption = {
  id: string;
  name: string;
};

type AdditionalMenuProps = {
  onAddNewItem?: () => void;
  displayAddNewItem?: boolean;
  addNewItemLabel?: string;
};

type MenuProps<Option extends SelectOption> = ComponentProps<
  typeof ReactSelectComponents.Menu<Option, false, GroupBase<Option>>
> & {
  selectProps: AdditionalMenuProps;
};

export type SearchableSelectProps<Option extends SelectOption = SelectOption> =
  Props<Option, false, GroupBase<Option>> &
    AdditionalMenuProps & {
      ariaLabel: string;
      options: OptionsOrGroups<Option, GroupBase<Option>>;
    };

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
    control: (base, state) => {
      const isError = state.selectProps.variant === "error";

      return {
        ...base,
        cursor: "pointer",
        color: semanticColors.foreground.secondary,
        fontSize: "14px",
        lineHeight: "16px",
        minHeight: "32px",
        padding: "0px",
        borderRadius: "8px",
        borderColor: isError
          ? semanticColors.accent.red
          : state.isFocused
          ? semanticColors.accent.brightPurple
          : semanticColors.border.secondary,
        boxShadow: isError
          ? shadows.input.error
          : state.isFocused
          ? shadows.input.focus
          : "0px 0px 0.5px rgba(0, 0, 0, 0.16), 0px 0.5px 2px rgba(0, 0, 0, 0.12);",
        background: state.isFocused
          ? semanticColors.background.secondary
          : semanticColors.background.primary,
        ":hover": {
          boxShadow: isError
            ? shadows.input.error
            : state.isFocused
            ? shadows.input.focus
            : "",
          borderColor: isError
            ? semanticColors.accent.red
            : state.isFocused
            ? semanticColors.accent.brightPurple
            : "inherit",
        },
      };
    },
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

const ClearIndicator = <
  Option,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: React.PropsWithChildren<ClearIndicatorProps<Option, false, Group>>
) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <ReactSelectComponents.ClearIndicator {...props}>
      <CloseIcon
        height="8px"
        width="8px"
        color={semanticColors.foreground.secondary}
      />
    </ReactSelectComponents.ClearIndicator>
  );
};

const Option = (props: OptionProps<SelectOption, false>) => {
  const { isFocused, isSelected, innerRef, innerProps } = props;
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

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
      cursor="pointer"
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

const Menu = <Option extends SelectOption>(props: MenuProps<Option>) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  const { children, selectProps } = props;

  return (
    <ReactSelectComponents.Menu {...props}>
      {children}
      {selectProps.displayAddNewItem && (
        <Flex
          background={semanticColors.background.secondary}
          borderColor={semanticColors.border.secondary}
          borderTopWidth="1px"
          color={semanticColors.accent.brightPurple}
          cursor="pointer"
          p="3"
          textStyle="text-ui-reg"
          onClick={() => {
            selectProps.onAddNewItem?.();
            selectProps.onMenuClose();
          }}
        >
          <Image alt="Plus icon" src={plus} mr="2" />
          {selectProps.addNewItemLabel ?? "Add New Item"}
        </Flex>
      )}
    </ReactSelectComponents.Menu>
  );
};

export interface SearchableSelectType
  extends React.ForwardRefExoticComponent<SearchableSelectProps<SelectOption>> {
  <T extends SelectOption>(
    props: React.PropsWithoutRef<SearchableSelectProps<T>> &
      React.RefAttributes<T>
  ): ReturnType<React.FC<SearchableSelectProps<T>>>;
}

const SearchableSelect: SearchableSelectType = React.forwardRef(
  (
    { options, ariaLabel, components, variant = "default", ...props },
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
          Menu: Menu,
          ClearIndicator: ClearIndicator,
          ...components,
        }}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        isMulti={false}
        isSearchable
        ref={ref}
        options={options}
        styles={buildStyles(semanticColors, shadows)}
        variant={variant}
        {...props}
      />
    );
  }
);

export default SearchableSelect;
