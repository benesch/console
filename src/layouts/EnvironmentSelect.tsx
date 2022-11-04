import {
  Box,
  ColorMode,
  HStack,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import React from "react";
import ReactSelect, {
  MultiValue,
  OptionProps,
  SingleValue,
  SingleValueProps,
  StylesConfig,
} from "react-select";
import { useRecoilState } from "recoil";

import { hasEnvironmentReadPermission, useAuth } from "../api/auth";
import {
  currentEnvironmentIdState,
  LoadedEnvironment,
  useEnvironmentsWithHealth,
} from "../recoil/environments";
import { reactSelectTheme } from "../theme";
import colors from "../theme/colors";

const EnvironmentSelectField = () => {
  const colorModeContext = useColorMode();
  const { user } = useAuth();
  const canReadEnvironments = hasEnvironmentReadPermission(user);
  const environments = useEnvironmentsWithHealth(user.accessToken, {
    intervalMs: 5000,
  });
  const [currentEnvironmentId, setCurrentEnvironmentId] = useRecoilState(
    currentEnvironmentIdState
  );

  const selectHandler = React.useCallback(
    (option: SingleValue<EnvOptionType> | MultiValue<EnvOptionType> | null) => {
      setCurrentEnvironmentId((option as EnvOptionType).id);
    },
    [environments, setCurrentEnvironmentId]
  );

  const colorStyles = React.useMemo(
    () => getColorStyles(colorModeContext.colorMode),
    [colorModeContext]
  );

  if (
    Array.from(environments.values()).every((e) => e.state === "disabled") ||
    !canReadEnvironments
  ) {
    return null;
  }

  const options = Array.from(environments, ([id, environment]) => ({
    id,
    environment,
  }));

  const currentOption = options.find((o) => o.id === currentEnvironmentId)!;

  return (
    <React.Suspense fallback={<Spinner />}>
      <ReactSelect
        id="environment-select"
        aria-label="Environment"
        name="environment-select"
        components={{ Option: EnvOption, SingleValue }}
        options={options}
        value={currentOption}
        onChange={selectHandler}
        styles={colorStyles}
        theme={(theme) => ({
          ...theme,
          ...reactSelectTheme,
        })}
        isMulti={false}
        isSearchable={false}
      />
    </React.Suspense>
  );
};

type EnvOptionType = {
  id: string;
  environment: LoadedEnvironment;
};

type DotProps = {
  environment: LoadedEnvironment;
};

const Dot = ({ environment }: DotProps) => {
  let color;
  switch (environment.state) {
    case "enabled": {
      switch (environment.health) {
        case "pending":
          // TODO: this should be a spinner. For now we just go with yellow.
          color = "yellow.400";
          break;
        case "booting":
          color = "yellow.400";
          break;
        case "healthy":
          color = "green.500";
          break;
        case "crashed":
          color = "red.400";
          break;
      }
      break;
    }
    case "disabled": {
      color = "gray.300";
      break;
    }
  }
  return (
    <Box
      height="10px"
      width="10px"
      mr={2}
      backgroundColor={color}
      borderRadius="10px"
    />
  );
};

const SingleValue: React.FunctionComponent<
  React.PropsWithChildren<SingleValueProps<EnvOptionType>>
> = ({ innerProps, data }) => {
  return (
    <HStack {...innerProps} spacing={0} color="white">
      <Dot environment={data.environment} />
      <Box>{data.id}</Box>
    </HStack>
  );
};

const EnvOption: React.FunctionComponent<
  React.PropsWithChildren<OptionProps<EnvOptionType>>
> = ({ innerProps, innerRef, data, ...props }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";
  const textColor = isDarkMode ? "white" : "black";
  const bg = isDarkMode ? "transparent" : "white";
  const selectedBg = isDarkMode ? `#FFFFFF18` : "gray.50";
  const hoverBg = isDarkMode ? `#FFFFFF24` : "gray.100";
  const activeBg = isDarkMode ? `#FFFFFF36` : "gray.200";
  return (
    <HStack
      ref={innerRef}
      {...innerProps}
      className="custom-option"
      color={props.isDisabled ? "gray.400" : textColor}
      cursor={props.isDisabled ? "not-allowed" : "pointer"}
      backgroundColor={props.isSelected ? selectedBg : bg}
      _hover={{
        backgroundColor: hoverBg,
      }}
      _active={{
        backgroundColor: activeBg,
      }}
      px="9px"
      py={2}
      spacing={0}
    >
      <Dot environment={data.environment} />
      <Box>{data.id}</Box>
    </HStack>
  );
};

const getColorStyles = (mode: ColorMode): StylesConfig<EnvOptionType> => {
  const isDarkMode = mode === "dark";
  return {
    control: (styles, state) => ({
      ...styles,
      backgroundColor: "transparent",
      color: state.isFocused ? colors.purple[400] : colors.white,
      minWidth: "200px",
      borderRadius: "0.375rem",
      ":hover": {
        ...styles[":hover"],
        borderColor: state.isFocused ? colors.purple[400] : colors.gray[100],
      },
      ":active": {
        ...styles[":active"],
        borderColor: colors.purple[400],
      },
    }),
    indicatorSeparator: () => ({}),
    dropdownIndicator: (styles, state) => ({
      ...styles,
      color: state.isFocused ? colors.purple[400] : colors.white,
      ":active": {
        ...styles[":active"],
      },
      ":hover": {
        ...styles[":hover"],
        color: state.isFocused ? colors.purple[400] : colors.gray[100],
      },
    }),
    menu: (styles) => ({
      ...styles,
      borderRadius: "0.375rem",
      backgroundColor: isDarkMode ? colors.gray[700] : styles.backgroundColor,
    }),
    valueContainer: (styles) => ({
      ...styles,
      display: "flex",
    }),
  };
};

export default EnvironmentSelectField;
