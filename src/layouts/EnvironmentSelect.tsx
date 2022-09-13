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
import { useRecoilState, useRecoilValue } from "recoil";

import { hasEnvironmentReadPermission, useAuth } from "../api/auth";
import {
  activeEnvironmentList,
  currentEnvironment,
  environmentList,
  environmentStatusMap,
  RegionEnvironment,
  singleEnvironmentStatus,
} from "../recoil/environments";
import { reactSelectTheme } from "../theme";
import colors from "../theme/colors";

const EnvironmentSelectField = () => {
  const [current, setCurrent] = useRecoilState(currentEnvironment);
  const colorModeContext = useColorMode();
  const [environments] = useRecoilState(environmentList);
  const [activeEnvironments] = useRecoilState(activeEnvironmentList);
  const [statusMap] = useRecoilState(environmentStatusMap);
  const { user } = useAuth();
  const canReadEnvironments = hasEnvironmentReadPermission(user);

  const options: EnvOptionType[] = React.useMemo(() => {
    if (environments) {
      return environments.map(makeEnvOption);
    }
    return [];
  }, [environments, statusMap]);

  const currentOption = React.useMemo(() => {
    return current ? makeEnvOption(current) : undefined;
  }, [current]);

  const selectHandler = React.useCallback(
    (option: SingleValue<EnvOptionType> | MultiValue<EnvOptionType> | null) => {
      /* This should never actually be an array, but typescript doesn't notice the isMulti=false prop >.< */
      if (!Array.isArray(option)) {
        setCurrent(
          option
            ? environments?.find(
                (env) =>
                  (option as EnvOptionType).value ===
                  `${env.region.provider}/${env.region.region}`
              ) || null
            : null
        );
      }
    },
    [environments, current, setCurrent]
  );

  const colorStyles = React.useMemo(
    () => getColorStyles(colorModeContext.colorMode),
    [colorModeContext]
  );

  if (!environments || environments.length < 1) {
    return <Spinner />;
  }

  if (
    (activeEnvironments && activeEnvironments.length < 1 && !current) ||
    !canReadEnvironments
  ) {
    return null;
  }

  return (
    <ReactSelect
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
  );
};

type EnvOptionType = {
  label: string;
  value: string;
};

function makeEnvOption({ region }: RegionEnvironment): EnvOptionType {
  return {
    label: `${region.provider}/${region.region}`,
    value: `${region.provider}/${region.region}`,
  };
}

type DotProps = {
  id: string;
};

const Dot = ({ id }: DotProps) => {
  const status = useRecoilValue(singleEnvironmentStatus(id));
  let color = "gray.300";
  switch (status) {
    case "Loading":
    case "Starting": {
      color = "yellow.400";
      break;
    }
    case "Enabled": {
      color = "green.500";
      break;
    }
    default: {
      color = "gray.300";
      break;
    }
  }
  return (
    <Box
      id={`status-dot-${id}`}
      height="10px"
      width="10px"
      mr={2}
      backgroundColor={color}
      borderRadius="10px"
    />
  );
};

const SingleValue: React.FunctionComponent<SingleValueProps<EnvOptionType>> = ({
  innerProps,
  data,
}) => {
  return (
    <HStack {...innerProps} spacing={0} color="white">
      <Dot id={data.value} />
      <Box>{data.label}</Box>
    </HStack>
  );
};

const EnvOption: React.FunctionComponent<OptionProps<EnvOptionType>> = ({
  innerProps,
  innerRef,
  data,
  ...props
}) => {
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
      <Dot id={data.value} />
      <Box>{data.label}</Box>
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
