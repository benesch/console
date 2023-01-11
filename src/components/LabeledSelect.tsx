import { split } from "@chakra-ui/object-utils";
import {
  chakra,
  DefaultIcon,
  forwardRef,
  HTMLChakraProps,
  layoutPropNames,
  omitThemingProps,
  SelectField,
  SelectProps,
  SystemStyleObject,
  useFormControl,
  useMultiStyleConfig,
  useTheme,
} from "@chakra-ui/react";
import { dataAttr } from "@chakra-ui/utils";
import * as React from "react";

export type LabeledSelectProps = SelectProps & { label: string };

// Much of this code was copied from
// https://github.com/chakra-ui/chakra-ui/blob/c483d859d015d850bc871cc5156f159a7694e795/packages/components/select/src/select.tsx
// So that I could add a label inside the wrapper component
const LabeledSelect = forwardRef<LabeledSelectProps, "select">((props, ref) => {
  const {
    colors: { semanticColors },
    radii,
  } = useTheme();

  const styles = useMultiStyleConfig("Select", props);

  const {
    rootProps,
    placeholder,
    icon,
    color,
    height,
    h,
    minH,
    minHeight,
    iconColor,
    iconSize,
    ...rest
  } = omitThemingProps(props);

  const [layoutProps, otherProps] = split(rest, layoutPropNames as any[]);

  const ownProps = useFormControl(otherProps);

  const rootStyles: SystemStyleObject = {
    // custom display value
    display: "flex",
    height: "fit-content",
    position: "relative",
    color,
  };

  const fieldStyles: SystemStyleObject = {
    paddingEnd: "2rem",
    ...styles.field,
    // custom styles
    height: "32px",
    borderRadius: `0 ${radii.md} ${radii.md} 0`,
    _focusVisible: {
      boxShadow: "none",
    },
    _focus: {
      zIndex: "unset",
      ...(styles as any).field?.["_focus"],
      outline: "none",
      border: "none",
      outlineOffset: 0,
    },
    // end custom styles
  };

  return (
    <chakra.div
      className="chakra-select__wrapper"
      __css={rootStyles}
      {...layoutProps}
      {...rootProps}
      justifyContent="center"
      alignItems="center"
      // custom styles
      borderRadius={radii.md}
      border={`1px solid ${semanticColors.border.secondary}`}
      _focusWithin={{
        border: `1px solid ${semanticColors.accent.brightPurple}`,
        boxShadow:
          "0px 0px 0px 0px hsla(0, 0%, 0%, 0), 0px 0px 0px 0px hsla(0, 0%, 0%, 0), 0px 0px 0px 2px hsla(257, 100%, 65%, 0.24)" /* accent.brightPurple */,
      }}
      // end custom styles
    >
      {/* This is the custom label we add */}
      <chakra.label
        sx={{
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "16px",
          padding: "8px 12px",
          borderRadius: `${radii.md} 0 0 ${radii.md}`,
          borderRight: `1px solid ${semanticColors.border.secondary}`,
          backgroundColor: semanticColors.background.secondary,
        }}
      >
        {props.label}
      </chakra.label>
      {/* end custom label*/}
      <SelectField
        ref={ref}
        height={h ?? height}
        minH={minH ?? minHeight}
        placeholder={placeholder}
        {...ownProps}
        __css={fieldStyles}
        border="none"
        _hover={{
          borderColor: "inherit",
        }}
      >
        {props.children}
      </SelectField>

      <SelectIcon
        data-disabled={dataAttr(ownProps.disabled)}
        {...((iconColor || color) && { color: iconColor || color })}
        __css={styles.icon}
        {...(iconSize && { fontSize: iconSize })}
      >
        {icon}
      </SelectIcon>
    </chakra.div>
  );
});

const IconWrapper = chakra("div", {
  baseStyle: {
    position: "absolute",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    top: "50%",
    transform: "translateY(-50%)",
  },
});

export type SelectIconProps = HTMLChakraProps<"div">;

const SelectIcon: React.FC<SelectIconProps> = (props) => {
  const { children = <DefaultIcon />, ...rest } = props;

  const clone = React.cloneElement(children as any, {
    role: "presentation",
    className: "chakra-select__icon",
    focusable: false,
    "aria-hidden": true,
    // force icon to adhere to `IconWrapper` styles
    style: {
      width: "1em",
      height: "1em",
      color: "currentColor",
    },
  });

  return (
    <IconWrapper {...rest} className="chakra-select__icon-wrapper">
      {React.isValidElement(children) ? clone : null}
    </IconWrapper>
  );
};

SelectIcon.displayName = "SelectIcon";

export default LabeledSelect;
