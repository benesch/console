import { ColorMode, Spinner, useColorMode } from "@chakra-ui/react";
import React from "react";
import ReactSelect, { StylesConfig } from "react-select";
import { useRecoilState } from "recoil";

import useAvailableEnvironments from "../api/useAvailableEnvironments";
import {
  currentEnvironment,
  EnvironmentStatus,
  RegionEnvironment,
} from "../recoil/environments";
import { reactSelectTheme } from "../theme";
import colors from "../theme/colors";

const EnvironmentSelectField = () => {
  const [current, setCurrent] = useRecoilState(currentEnvironment);
  const colorModeContext = useColorMode();
  const { statusMap, environments, activeEnvironments, canReadEnvironments } =
    useAvailableEnvironments();

  const options: EnvOption[] = React.useMemo(() => {
    if (environments) {
      return environments.map((env: RegionEnvironment) => {
        const status: EnvironmentStatus =
          statusMap[`${env.region.provider}/${env.region.region}`] ||
          "Not started";
        return makeEnvOption(env, status);
      });
    }
    return [];
  }, [environments, statusMap]);

  const currentOption = React.useMemo(() => {
    return current
      ? makeEnvOption(
          current,
          statusMap[`${current.region.provider}/${current.region.region}`]
        )
      : undefined;
  }, [
    current,
    statusMap[`${current?.region?.provider}/${current?.region?.region}`],
  ]);

  const selectHandler = React.useCallback(
    (option: EnvOption | null) => {
      setCurrent(
        option
          ? environments?.find(
              (env) =>
                option.value === `${env.region.provider}/${env.region.region}`
            ) || null
          : null
      );
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

type EnvOption = {
  key: string;
  label: string;
  value: string;
  color: string;
};

function makeEnvOption(
  { region }: RegionEnvironment,
  status?: EnvironmentStatus
): EnvOption {
  let color: string = colors.gray[300];
  switch (status) {
    case "Loading":
    case "Starting": {
      color = colors.yellow[400];
      break;
    }
    case "Enabled": {
      color = colors.green[500];
      break;
    }
    default: {
      color = colors.gray[300];
      break;
    }
  }
  return {
    key: `${region.provider}/${region.region}`,
    label: `${region.provider}/${region.region}`,
    value: `${region.provider}/${region.region}`,
    color,
  };
}

const dot = (color = "transparent") => ({
  alignItems: "center",
  display: "flex",

  ":before": {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: "block",
    marginRight: 8,
    height: 10,
    width: 10,
  },
});

const getColorStyles = (mode: ColorMode): StylesConfig<EnvOption> => {
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
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      const hoverBg = isDarkMode ? `#FFFFFF18` : colors.gray[50];
      const selectedHoverBg = isDarkMode
        ? colors.purple[700]
        : colors.gray[100];
      let backgroundColor = "transparent";
      if (isFocused) {
        backgroundColor = isDarkMode ? colors.purple[800] : colors.gray[100];
      }
      if (isSelected) {
        if (isFocused) {
          backgroundColor = selectedHoverBg;
        } else {
          backgroundColor = hoverBg;
        }
      }
      const textColor = isDarkMode ? colors.white : colors.black;
      return {
        ...styles,
        backgroundColor,
        color: isDisabled ? colors.gray[400] : textColor,
        cursor: isDisabled ? "not-allowed" : "default",

        ":active": {
          ...styles[":active"],
          backgroundColor: isDarkMode ? colors.purple[900] : colors.gray[200],
        },
        ...dot(data.color),
      };
    },
    input: (styles) => ({ ...styles, ...dot() }),
    placeholder: (styles) => ({ ...styles, ...dot() }),
    singleValue: (styles, { data }) => ({
      ...styles,
      ...dot(data.color),
      color: "white",
    }),
  };
};

export default EnvironmentSelectField;
