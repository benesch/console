import { useColorMode } from "@chakra-ui/color-mode";
import { FronteggProvider } from "@frontegg/react";
import React from "react";
import { RecoilRoot } from "recoil";

import { RestfulProvider } from "./api/auth";
import LoadingScreen from "./loading";
import Router from "./router";
import { fronteggAuthPageBackground, getFronteggTheme } from "./theme";

type Props = {
  baseUrl: string;
};

const FronteggWrappedContents = ({ baseUrl }: Props) => {
  const [loading, setLoading] = React.useState(true);
  const { colorMode } = useColorMode();
  const theme = React.useMemo(() => {
    return getFronteggTheme(colorMode);
  }, [colorMode]);

  return (
    <>
      <FronteggProvider
        contextOptions={{ baseUrl }}
        backgroundImage={fronteggAuthPageBackground}
        themeOptions={theme}
        customLoader={setLoading}
        authOptions={{ keepSessionAlive: true }}
      >
        {loading ? (
          <LoadingScreen />
        ) : (
          <RestfulProvider>
            <RecoilRoot>
              <Router />
            </RecoilRoot>
          </RestfulProvider>
        )}
      </FronteggProvider>
    </>
  );
};

export default FronteggWrappedContents;
