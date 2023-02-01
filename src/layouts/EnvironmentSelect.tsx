import {
  Box,
  ColorMode,
  HStack,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import ReactSelect, {
  MultiValue,
  OptionProps,
  SingleValue,
  SingleValueProps,
  StylesConfig,
} from "react-select";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { hasEnvironmentReadPermission, useAuth } from "~/api/auth";
import {
  currentEnvironmentIdState,
  LoadedEnvironment,
  useEnvironmentsWithHealth,
} from "~/recoil/environments";
import colors from "~/theme/colors";
import { isPollingDisabled } from "~/util";

const environmentSlugRegex = new RegExp("^\\/([\\w-]*)\\/?");

const EnvironmentSelectField = () => {
  const colorModeContext = useColorMode();
  const { user } = useAuth();
  const canReadEnvironments = hasEnvironmentReadPermission(user);
  const environments = useEnvironmentsWithHealth(user.accessToken, {
    intervalMs: isPollingDisabled() ? undefined : 5000,
  });
  const navigate = useNavigate();
  const currentEnvironmentId = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentIdState
  );

  const selectHandler = React.useCallback(
    (option: SingleValue<EnvOptionType> | MultiValue<EnvOptionType> | null) => {
      const regionId = (option as EnvOptionType).id
        .replace("/", "-")
        .toLowerCase();
      const matches = environmentSlugRegex.exec(location.pathname);
      if (matches) {
        const newPath = location.pathname.replace(matches[1], `${regionId}`);
        navigate(newPath + location.search + location.hash);
      }
    },
    [navigate]
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
  let health;
  switch (environment.state) {
    case "enabled": {
      switch (environment.health) {
        case "pending":
          // This state never shows, we don't render this until the data is loaded
          color = "yellow.400";
          health = "pending";
          break;
        case "booting":
          color = "yellow.400";
          health = "booting";
          break;
        case "healthy":
          color = "green.500";
          health = "healthy";
          break;
        case "crashed":
          color = "red.400";
          health = "crashed";
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
      data-testid={`health-${health}`}
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
    <HStack {...innerProps} spacing={0}>
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
  const selectedBg = isDarkMode ? `#FFFFFF18` : "transparent";
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
  const unfocusedBorderColor = isDarkMode ? colors.gray[600] : colors.gray[300];
  const unfocusedIconHoverColor = isDarkMode
    ? colors.gray[300]
    : colors.gray[500];
  return {
    control: (styles, state) => ({
      ...styles,
      backgroundColor: "transparent",
      minWidth: "200px",
      borderRadius: "8px",
      borderColor: state.isFocused ? colors.purple[400] : unfocusedBorderColor,
    }),
    indicatorSeparator: () => ({}),
    dropdownIndicator: (styles) => ({
      ...styles,
      color: isDarkMode ? colors.gray[300] : colors.gray[500],
      ":active": {
        ...styles[":active"],
      },
      ":hover": {
        ...styles[":hover"],
        color: unfocusedIconHoverColor,
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
