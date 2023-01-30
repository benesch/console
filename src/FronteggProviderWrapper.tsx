import { useColorMode } from "@chakra-ui/color-mode";
import { FronteggProvider, LocalizationOverrides } from "@frontegg/react";
import React from "react";

import LoadingScreen from "~/loading";
import { fronteggAuthPageBackground, getFronteggTheme } from "~/theme";

type Props = {
  baseUrl: string;
  children?: React.ReactNode;
};

const FronteggProviderWrapper: React.FC<Props> = ({ baseUrl, children }) => {
  const [loading, setLoading] = React.useState(true);
  const { colorMode } = useColorMode();
  const theme = React.useMemo(() => {
    return getFronteggTheme(colorMode);
  }, [colorMode]);
  const localizations: LocalizationOverrides = {
    loginBox: {
      forgetPassword: {
        submitButtonText: "Reset password",
      },
    },
  };

  return (
    <>
      {loading && <LoadingScreen />}
      <FronteggProvider
        localizations={{ en: localizations }}
        contextOptions={{ baseUrl }}
        backgroundImage={fronteggAuthPageBackground}
        themeOptions={theme}
        customLoader={setLoading}
        authOptions={{ keepSessionAlive: true }}
      >
        {!loading && children}
      </FronteggProvider>
    </>
  );
};

export default FronteggProviderWrapper;
